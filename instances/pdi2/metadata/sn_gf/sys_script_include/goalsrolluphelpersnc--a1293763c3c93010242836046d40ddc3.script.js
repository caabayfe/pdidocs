var GoalsRollUpHelperSNC = Class.create();
GoalsRollUpHelperSNC.prototype = {
    initialize: function(parentGoalGR, previousGR, currentGR) {
        this.parentGoalGR = this._getGlideRecord(parentGoalGR); // Parent goal of the subgoal or the goal of the target that is updated.
        this.previousGR = previousGR; // Previous version of the updated goal/target
        this.currentGR = currentGR; // Current version of the updated goal/target
        this.weightEnabledForCalc = sn_gf.GoalConfigUtil.isWeightedAverageEnabled();
    },

    _getGlideRecord: function(gr) {
        if (global.JSUtil.nil(gr) || !gr.isValidRecord())
            return;
        var glideRecord = new GlideRecord(gr.getValue("sys_class_name"));
        if (glideRecord.get(gr.getValue("sys_id")))
            return glideRecord;
        return;
    },

    rollUpPercentComplete: function() {
        if (this.parentGoalGR.getValue("sys_id") === sn_gf.commonAncestor && !sn_gf.currHierarchy) {
            sn_gf.currHierarchy = true;
            return;
        }
        var newGoalPC = this._getCompleteRecalculatedPercentComplete();
        this.parentGoalGR.setValue("percent_complete", newGoalPC);
        this.parentGoalGR.update();
    },

    rollUpPercentCompleteWhenParentChanges: function() {
        //Here we are traversing both previous parent and new parent heirachies to find lowest common ancestor, while rolling up previous parent hierarchy we will stop rollup before common ancestor and while rolling up new parent hierarchy we will rollup till root node.
        //This help will help us preventing multiple times updation of common nodes present in both hierarchies.
        if (sn_gf.GFUtil.isInstanceOfCoreGoal(this.currentGR.getTableName())) {
            this._traverse(this.previousGR.getValue("parent_goal"), true);
            this._traverse(this.currentGR.getValue("parent_goal"), false);
        } else {
            this._traverse(this.previousGR.getValue("goal"), true);
            this._traverse(this.currentGR.getValue("goal"), false);
        }

        const prevHierarchyNodesLength = (global.JSUtil.notNil(sn_gf.traversedPrevNodes) ? sn_gf.traversedPrevNodes.length : 0);
        const currHierarchyNodesLength = (global.JSUtil.notNil(sn_gf.traversedCurrNodes) ? sn_gf.traversedCurrNodes.length : 0);
        var i = Math.min(prevHierarchyNodesLength, currHierarchyNodesLength) - 1;
        while (i >= 0) {
            if (sn_gf.traversedPrevNodes[i] != sn_gf.traversedCurrNodes[i]) {
                break;
            } else {
                sn_gf.commonAncestor = sn_gf.traversedPrevNodes[i];
            }
            i--;
        }
        this.rollUpPercentComplete();
    },

    _traverse: function(sys_id, prev) {
        if (global.JSUtil.nil(sys_id))
            return;

        var gr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE);
        if (gr.get(sys_id)) {
            if (prev) {
                if (!sn_gf.traversedPrevNodes)
                    sn_gf.traversedPrevNodes = [];

                sn_gf.traversedPrevNodes.push(sys_id);
            } else {
                if (!sn_gf.traversedCurrNodes)
                    sn_gf.traversedCurrNodes = [];

                sn_gf.traversedCurrNodes.push(sys_id);
            }
			return this._traverse(gr.getValue("parent_goal"), prev);
        }
		return;
    },

    _getCompleteRecalculatedPercentComplete: function() {
        var subGoalsProgress = this.weightEnabledForCalc ? this._getSubGoalsProgressWeightIsEnabledForCalc() : this._getSubGoalsProgressWeightIsNotEnabledForCalc();
        var targetsProgress = this.weightEnabledForCalc ? this._getTargetsProgressWeightIsEnabledForCalc() : this._getTargetsProgressWeightIsNotEnabledForCalc();
        var newTotalWeight = (subGoalsProgress.weight ? parseInt(subGoalsProgress.weight) : 0) + (targetsProgress.weight ? parseInt(targetsProgress.weight) : 0);
        if (newTotalWeight == 0)
            return 0;

        var newTotalProgress = (subGoalsProgress.percent_complete ? parseFloat(subGoalsProgress.percent_complete) : 0) + (targetsProgress.percent_complete ? parseFloat(targetsProgress.percent_complete) : 0);
        if (newTotalProgress == 0)
            return 0;

        return newTotalProgress / newTotalWeight;
    },

    _getSubGoalsProgressWeightIsEnabledForCalc: function() {
        var subGoalsProgress = {};
        var subGoalsGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE);
        subGoalsGr.addQuery("parent_goal", this.parentGoalGR.getValue("sys_id"));
        subGoalsGr.addQuery("roll_up_progress", true);
        subGoalsGr.query();
        var totalProgress = 0;
        var totalWeight = 0;
        while (subGoalsGr.next()) {
            var progress = subGoalsGr.getValue("percent_complete");
            var weight = parseInt(subGoalsGr.getValue("weight"));
            totalProgress += (progress * weight);
            totalWeight += weight;
        }
        subGoalsProgress.percent_complete = totalProgress;
        subGoalsProgress.weight = totalWeight;
        return subGoalsProgress;
    },

    _getSubGoalsProgressWeightIsNotEnabledForCalc: function() {
        var subGoalsProgress = {};
        var subGoalsAgg = new GlideAggregate(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE);
        subGoalsAgg.addAggregate("SUM", "percent_complete");
        subGoalsAgg.addAggregate("COUNT");
        subGoalsAgg.setGroup(true);
        subGoalsAgg.groupBy("parent_goal");
        subGoalsAgg.addQuery("parent_goal", this.parentGoalGR.getValue("sys_id"));
        subGoalsAgg.addQuery("roll_up_progress", true);
        subGoalsAgg.query();
        if (subGoalsAgg.next()) {
            subGoalsProgress.percent_complete = subGoalsAgg.getAggregate("SUM", "percent_complete");
            subGoalsProgress.weight = subGoalsAgg.getAggregate("COUNT");
        }
        return subGoalsProgress;
    },

    _getTargetsProgressWeightIsEnabledForCalc: function() {
        var targetsProgress = {};
        var targetsGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targetsGr.addQuery("goal", this.parentGoalGR.getValue("sys_id"));
        targetsGr.query();
        var totalProgress = 0;
        var totalWeight = 0;
        while (targetsGr.next()) {
            var progress = targetsGr.getValue("percent_complete");
            var weight = parseInt(targetsGr.getValue("weight"));
            totalProgress += (progress * weight);
            totalWeight += weight;
        }
        targetsProgress.percent_complete = totalProgress;
        targetsProgress.weight = totalWeight;
        return targetsProgress;
    },

    _getTargetsProgressWeightIsNotEnabledForCalc: function() {
        var targetsProgress = {};
        var targetsAgg = new GlideAggregate(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targetsAgg.addAggregate("SUM", "percent_complete");
        targetsAgg.addAggregate("COUNT");
        targetsAgg.setGroup(true);
        targetsAgg.groupBy("goal");
        targetsAgg.addQuery("goal", this.parentGoalGR.getValue("sys_id"));
        targetsAgg.query();
        if (targetsAgg.next()) {
            targetsProgress.percent_complete = targetsAgg.getAggregate("SUM", "percent_complete");
            targetsProgress.weight = targetsAgg.getAggregate("COUNT");
        }
        return targetsProgress;
    },

    needToRollUpGoalPC: function(currentGR, previousGR) {
        if (currentGR.getTableName() == sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE && this.isGoalDeleted(currentGR)) {
            return false;
        } else if (currentGR.operation() == 'insert' && parseInt(currentGR.getValue('weight')) == 0) {
            return false;
        } else if (currentGR.operation() == 'delete' && parseInt(currentGR.getValue('weight')) == 0) {
            return false;
        } else if (currentGR.getTableName() == sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE && currentGR.operation() == 'update' && !currentGR.percent_complete.changes() && !currentGR.weight.changes() && !currentGR.goal.changes()) {
            return false;
        } else if (sn_gf.GFUtil.isInstanceOfCoreGoal(currentGR.getTableName()) && currentGR.operation() == 'update' && !currentGR.percent_complete.changes() && !currentGR.weight.changes() && !currentGR.parent_goal.changes() && !currentGR.roll_up_progress.changes()) {
            return false;
        } else if (currentGR.operation() == 'insert' && sn_gf.GFUtil.isInstanceOfCoreGoal(currentGR.getTableName()) && currentGR.getValue('roll_up_progress') == false) {
            return false;
        }
        return true;
    },

    isGoalDeleted: function(currentGR) {
        var gr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE);
        if (gr.get(currentGR.getValue('goal'))) {
            return false;
        }
        return true;
    },

    type: 'GoalsRollUpHelperSNC'
};
