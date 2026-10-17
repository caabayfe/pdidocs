var GFCoreGoal = Class.create();
GFCoreGoal.prototype = {
    initialize: function(goalId, goalGR) {
        this.goalId = goalId;
        this.goalGR = goalGR;
    },

    getGoalGR: function(goalId) {
        if (!this.goalGR) {
            if (!goalId)
                this.goalId = goalId;
            this.goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
            this.goalGR.get(this.goalId);
        }
        return this.goalGR;
    },

    getTargetsGR: function(encodedQuery) {
        var targets = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targets.addQuery("goal", this.goalId);
        if (encodedQuery)
            targets.addEncodedQuery(encodedQuery);
        targets.query();
        return targets;
    },

    getSubGoalsGR: function(encodedQuery) {
        var subGoalsGR = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
        subGoalsGR.addQuery("parent_goal", this.goalId);
        if (encodedQuery)
            subGoalsGR.addEncodedQuery(encodedQuery);
        subGoalsGR.query();
        return subGoalsGR;
    },

    getParentGoalGR: function(encodedQuery) {
        var parentGoalGR = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
        parentGoalGR.addQuery("sys_id", this.getGoalGR().getValue("parent_goal"));
        if (encodedQuery)
            parentGoalGR.addEncodedQuery(encodedQuery);
        parentGoalGR.query();
        return parentGoalGR;
    },

    containsChild: function() {
        return this.getTargetsGR().hasNext() || this.getSubGoalsGR().hasNext();
    },

    isCircularLoopExists: function() {
        return GFUtil.checkCircularLoop(this.goalId, this.getGoalGR().getValue("parent_goal"), GoalFrameworkConstants.GOAL_CORE_TABLE, "parent_goal");
    },

    doesGoalRelationshipExists: function() {
        var goalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery('goal', this.goalId);
        goalRelationshipGr.query();
        return goalRelationshipGr.hasNext();
    },

    doesSubGoalsExists: function() {
        var goalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
        goalRelationshipGr.addQuery('parent_goal', this.goalId);
        goalRelationshipGr.query();
        return goalRelationshipGr.hasNext();
    },

    canDelete: function() {
        var result = {};
        result.canDelete = sn_gf.GoalConfigUtil.isGoalDeletionAllowed();
        var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        var goalsLabel = sn_gf.GFUtil.getTablePluralLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        if (!result.canDelete) {
            result.message = gs.getMessage("Deletion of {0} is not enabled. Please reach out to your admin for changing the settings to allow deletion.", goalsLabel);
        } else if (this.doesGoalRelationshipExists() || this.doesSubGoalsExists()) {
            result.canDelete = false;
            result.message = gs.getMessage("A {0} cannot be deleted when it has any sub-{1} or associated work/planning items.", [goalLabel, goalsLabel]);
        }
        return result;
    },

    validateDates: function() {
        var errorMsg = "";
        if (global.JSUtil.notNil(this.getGoalGR().start_date) && global.JSUtil.notNil(this.getGoalGR().end_date) && this.getGoalGR().start_date > this.getGoalGR().end_date) {
            errorMsg = gs.getMessage("Start date cannot be later than the end date.");
            return errorMsg;
        }
        var encodedQuery = "start_date<" + this.getGoalGR().getValue("start_date") + "^ORend_date>" + this.getGoalGR().getValue("end_date");
        var targetsOutsideGoalDates = this.getTargetsGR(encodedQuery);
        var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        var goalsLabel = sn_gf.GFUtil.getTablePluralLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        var targetsLabel = sn_gf.GFUtil.getTablePluralLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
        if (targetsOutsideGoalDates.next()) {
            if (targetsOutsideGoalDates.start_date < this.getGoalGR().start_date)
                errorMsg = gs.getMessage("Start date of the {0} cannot be later than the start date of its {1}.", [goalLabel, targetsLabel]);
            else
                errorMsg = gs.getMessage("End date of the {0} cannot be earlier than the end date of its {1}.", [goalLabel, targetsLabel]);
            return errorMsg;
        }
        var subGoalsOutsideGoalDates = this.getSubGoalsGR(encodedQuery);
        if (subGoalsOutsideGoalDates.next()) {
            if (subGoalsOutsideGoalDates.start_date < this.getGoalGR().start_date)
                errorMsg = gs.getMessage("Start date of the {0} cannot be later than the start date of its sub-{1}.", [goalLabel, goalsLabel]);
            else
                errorMsg = gs.getMessage("End date of the {0} cannot be earlier than the end date of its sub-{1}.", [goalLabel, goalsLabel]);
            return errorMsg;
        }
        return errorMsg;
    },

    validateSubGoalDates: function() {
        var parentGoalGr = this.getParentGoalGR();
        if (!parentGoalGr.hasNext())
            return "";
        parentGoalGr.next();
        var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        var errorMsg = gs.getMessage("The start and end dates must be within the dates ({0} and {1}) of the parent {2}.", [GlideStringUtil.escapeHTML(parentGoalGr.getDisplayValue('start_date')), GlideStringUtil.escapeHTML(parentGoalGr.getDisplayValue('end_date')), goalLabel]);

        var goalGr = this.getGoalGR();
        var subGoalStartDate = goalGr.start_date;
        var subGoalEndDate = goalGr.end_date;
        var parentGoalStartDate = parentGoalGr.start_date;
        var parentGoalEndDate = parentGoalGr.end_date;
        if (global.JSUtil.notNil(subGoalStartDate)) {
            if ((global.JSUtil.notNil(parentGoalStartDate) && parentGoalStartDate > subGoalStartDate) || (global.JSUtil.notNil(parentGoalEndDate) && parentGoalEndDate < subGoalStartDate)) {
                return errorMsg;
            }
        }
        if (global.JSUtil.notNil(subGoalEndDate)) {
            if ((global.JSUtil.notNil(parentGoalStartDate) && parentGoalStartDate > subGoalEndDate) || (global.JSUtil.notNil(parentGoalEndDate) && parentGoalEndDate < subGoalEndDate)) {
                return errorMsg;
            }
        }
        return "";
    },

    type: 'GFCoreGoal'
};
