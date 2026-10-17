var GoalFrameworkAjaxProcessor = Class.create();
GoalFrameworkAjaxProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    isAtleastOneTargetIsOfNonMilestoneType: function(targetSysIds) {
        var response = {};
        var targetGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_TARGET_TABLE);
        if (targetGr.isValid()) {
            targetGr.addQuery('sys_id', 'IN', targetSysIds ? targetSysIds : this.getParameter('sysparm_target_sys_ids'));
            targetGr.addQuery('type', '!=', 'milestone');
            targetGr.setLimit(1);
            targetGr.query();
            if (targetGr.hasNext())
                response['recordOfNonMilestoneType'] = true;
            else
                response['recordOfNonMilestoneType'] = false;
        }
        return JSON.stringify(response);
    },

    doesTargetContainProgress: function(targetSysIds) {
        var response = {};
        var targetGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetGr.isValid()) {
            targetGr.addQuery('target.sys_id', 'IN', targetSysIds ? targetSysIds : this.getParameter('sysparm_target_sys_ids'));
            targetGr.setLimit(1);
            targetGr.query();
            if (targetGr.hasNext())
                response['hasProgressRecord'] = true;
            else
                response['hasProgressRecord'] = false;
        }
        return JSON.stringify(response);
    },

    resetPercentComplete: function(targetSysIds) {
        var response = {};
        var targetGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_TARGET_TABLE);
        if (targetGr.isValid()) {
            targetGr.addQuery('sys_id', 'IN', targetSysIds ? targetSysIds : this.getParameter('sysparm_target_sys_ids'));
            targetGr.addQuery('type', '!=', 'milestone');
            targetGr.query();
            while (targetGr.next()) {
                targetGr.setValue('percent_complete', '');
                if (targetGr.update()) {
                    response['percentCompleteUpdated'] = true;
                    return JSON.stringify(response);
                }
            }
        }
        response['percentCompleteUpdated'] = false;
        return JSON.stringify(response);
    },

    getGoalDates: function(parentGoal) {
        var response = {};
        var goalGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_CORE_TABLE);
        if (goalGr.get(parentGoal ? parentGoal : this.getParameter('sysparm_parent_goal'))) {
            response['start_date'] = goalGr.getDisplayValue('start_date');
            response['end_date'] = goalGr.getDisplayValue('end_date');
        } else {
            var currentQuarter = new GlideRecordSecure("business_calendar_span");
            if (sn_gf.GoalConfigUtil.getCalendarType() === "fiscal_period")
                currentQuarter.addQuery("calendar", GoalFrameworkConstants.FISCAL_QUARTER_ID);
            else
                currentQuarter.addQuery("calendar", GoalFrameworkConstants.GREGORIAN_QUARTER_ID);

            currentQuarter.addEncodedQuery("start<=javascript:gs.endOfToday()^end>=javascript:gs.beginningOfToday()");
            currentQuarter.query();
            if (currentQuarter.next()) {
                response['start_date'] = GlideDateTime(currentQuarter.getValue("start")).getDate().getDisplayValue();
                response['end_date'] = GlideDateTime(currentQuarter.getValue("end")).getDate().getDisplayValue();
            }
        }
        return JSON.stringify(response);
    },

    getDefaultGoalDatesFromStrategy: function(strategy) {

        var response = {};
        var strategyGr = new GlideRecordSecure(GoalFrameworkConstants.STRATEGY_TABLE);
        if (strategyGr.get(strategy ? strategy : this.getParameter('sysparm_strategy'))) {
            if (strategyGr.getValue('start_date'))
                response['start_date'] = strategyGr.getDisplayValue('start_date');
            if (strategyGr.getValue('end_date'))
                response['end_date'] = strategyGr.getDisplayValue('end_date');
        }
        return JSON.stringify(response);
    },

    getDefaultStrategyDatesFromStrategicPlan: function(strategicPlan) {
        var response = {};
        var strategicPlanGr = new GlideRecordSecure(GoalFrameworkConstants.STRATEGIC_PLAN);
        if (strategicPlanGr.get(strategicPlan ? strategicPlan : this.getParameter('sysparm_strategic_plan'))) {
            if (strategicPlanGr.getValue('start_date')) {
                response['start_date'] = strategicPlanGr.getDisplayValue('start_date');
            }
            if (strategicPlanGr.getValue('end_date')) {
                response['end_date'] = strategicPlanGr.getDisplayValue('end_date');
            }
        }
        return JSON.stringify(response);
    },

    canEditGoal: function(goal_Id) {
        var response = {
            'canEdit': false
        };
        var goalId = goal_Id ? goal_Id : this.getParameter('sysparm_goal_id');
        var goalGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_TABLE);
        if (goalGr.get(goalId)) {
            response['canEdit'] = goalGr.canWrite();
        }
        return JSON.stringify(response);
    },

    getReviewDate: function(review_Date, start_Date, end_Date, review_Freq) {
        var response = {};
        var msg;
        var targetId = this.getParameter('sysparm_sys_id');
        var targetGR = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targetGR.get(targetId);
        var oldReviewDate = review_Date ? review_Date : this.getParameter('sysparm_review_date');
        var startDate = start_Date ? start_Date : this.getParameter('sysparm_start_date');
        var startDateGlide = new GlideDate();
		startDateGlide.setDisplayValue(startDate);
        var reviewDate = (new GFTarget(targetId, targetGR)).getNextReviewDate(new GlideDateTime(startDateGlide), review_Freq ? review_Freq : this.getParameter('sysparm_review_freq'));
        if (reviewDate) {
            var endDate = new GlideDate();
			endDate.setDisplayValue(end_Date ? end_Date : this.getParameter('sysparm_end_date'));
			
            reviewDate = (endDate && (endDate < reviewDate)) ? endDate : reviewDate;
            var userDateFormat = gs.getDateFormat();
            response['review_due_date'] = reviewDate.getByFormat(userDateFormat);
        }
        return JSON.stringify(response);
    },

    getReviewDateWhenEndDateChanged: function(review_Date, start_Date, end_Date, old_End_Date, review_Freq) {
        var targetId = this.getParameter('sysparm_sys_id');
        var targetGR = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targetGR.get(targetId);
        var gfTarget = new GFTarget(targetId, targetGR);
        var reviewDate;
        var response = {};
        var checkinFreq = this.getParameter('sysparm_review_freq');
        var startDate = start_Date ? start_Date : this.getParameter('sysparm_start_date');
        var startDateGlide = new GlideDate();
		startDateGlide.setDisplayValue(startDate);
        var oldReviewDate = review_Date ? review_Date : this.getParameter('sysparm_review_date');
        var endDate = new GlideDate();
		endDate.setDisplayValue(end_Date ? end_Date : this.getParameter('sysparm_end_date'));
        var oldEndDate = new GlideDateTime(targetGR.getValue("end_date")).getDate();

        if (GlidePluginManager.isActive("com.snc.advanced_goal_framework") && oldEndDate.before(new GlideDateTime(endDate))) // In case of expansion of end date, we shouldn't update the review date as we are not regenerating the breakdowns.
            return;

        reviewDate = (new GFTarget(targetId, targetGR)).getNextReviewDate(new GlideDateTime(startDateGlide), review_Freq ? review_Freq : this.getParameter('sysparm_review_freq'));
        if (reviewDate) {
            reviewDate = (endDate && (endDate < reviewDate)) ? endDate : reviewDate;
            var userDateFormat = gs.getDateFormat();
            response['review_due_date'] = reviewDate.getByFormat(userDateFormat);
        }

        return JSON.stringify(response);
    },

    getGoalFromTarget: function() {
        var response = {};
        var targetGr = new GlideRecordSecure(GoalFrameworkConstants.GOAL_TARGET_TABLE);
        targetGr.get(this.getParameter('sysparm_new_value'));
        if (targetGr.isValid()) {
            response = targetGr.getValue('goal');
        }
        return JSON.stringify(response);
    },

    targetHasBreakdowns: function() {
        var hasBreakdowns = false;
        if (GlidePluginManager.isActive('sn_gfa')) {
            var gr = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
            gr.addQuery("target", this.getParameter('sysparm_target_sys_id'));
            gr.query();
            hasBreakdowns = gr.hasNext();
        }
        return JSON.stringify({
            "targetHasBreakdowns": hasBreakdowns
        });
    },

    getWarningMessageForUnitOfMeasure: function() {
        var oldValueSysId = this.getParameter('sysparm_old_value');
        var newValueSysId = this.getParameter('sysparm_new_value');
        var oldValueGR = new GlideRecordSecure(sn_gf.GoalFrameworkConstants.TARGET_UNITS_TABLE);
        oldValueGR.get(oldValueSysId);
        var newValueGR = new GlideRecordSecure(sn_gf.GoalFrameworkConstants.TARGET_UNITS_TABLE);
        newValueGR.get(newValueSysId);
        var message;
        if (global.JSUtil.notNil(oldValueSysId) && global.JSUtil.notNil(newValueSysId) && // Handle new target cases where UnitOfMeasure is Null
            global.JSUtil.notNil(oldValueGR) && global.JSUtil.notNil(newValueGR) &&
            !(oldValueGR.choice_set && newValueGR.choice_set) && // If old and new type has choice sets, then both are Qualitative types
            (oldValueGR.choice_set != newValueGR.choice_set)) { // If old and new type has same choice sets, then type is unchanged
            if (oldValueGR.choice_set) { // oldValue is Qualitative
                message = gs.getMessage("Changing the unit of measure from Qualitative ({0}) to Quantitative ({1}) clears all fields in the Metrics section", [oldValueGR.getValue("name"), newValueGR.getValue("name")]);
            } else if (newValueGR.choice_set) { // newValue is Qualitative
                message = gs.getMessage("Changing the unit of measure from Quantitative ({0}) to Qualitative ({1}) clears all fields in the Metrics section", [oldValueGR.getValue("name"), newValueGR.getValue("name")]);
                if (GlidePluginManager.isActive('sn_gfa')) {
                    message += gs.getMessage(" and deletes the target breakdowns if any");
                }
            }
            if (message) {
                message += gs.getMessage(", after you save the form. \n\nDo you want to proceed?");
            }
        }

        return JSON.stringify({
            "warningMessage": message
        });
    },

    type: 'GoalFrameworkAjaxProcessor'
});
