var GFTarget = Class.create();
GFTarget.prototype = {
    initialize: function(targetId, targetGR) {
        this.targetId = targetId;
        this.targetGR = targetGR;
        this.weekDayOffsetMap = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6
        };
        this.calendarSpanSysIds = {
            "weekly": "2d87b2e7530c101076bcddeeff7b1225",
            "monthly": "4d7ddda353f3001076bcddeeff7b12b1",
            "quarterly": "857ddda353f3001076bcddeeff7b12af",
            "yearly": "017d95a353f3001076bcddeeff7b121a"
        };
    },

    getTargetGR: function(targetId) {
        if (!this.targetGR) {
            if (!targetId)
                this.targetId = targetId;
            this.targetGR = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_TABLE);
            this.targetGR.get(this.targetId);
        }
        return this.targetGR;
    },

    getGoalGR: function(encodedQuery) {
        var goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
        goalGR.addQuery("sys_id", this.getTargetGR().getValue('goal'));
        if (encodedQuery)
            goalGR.addEncodedQuery(encodedQuery);
        goalGR.query();
        return goalGR;
    },

    doesGoalExist: function() {
        var goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
        return goalGR.get(this.getTargetGR().getValue('goal'));
    },

    hasTargetRelationship: function() {
        if (GlidePluginManager.isActive('sn_gfa')) {
            var goalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
            goalRelationshipGr.addQuery('target', this.targetId);
            goalRelationshipGr.query();
            return goalRelationshipGr.hasNext();
        }
        return false;
    },

    canDelete: function() {
        var result = {};
        if (!this.doesGoalExist()) { //Goal is already deleted
            result.canDelete = true;
            return result;
        }
        result.canDelete = sn_gf.GoalConfigUtil.isTargetDeletionAllowed();
        if (!result.canDelete) {
            var targetsLabel = sn_gf.GFUtil.getTablePluralLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
            result.message = gs.getMessage("Deletion of {0} is not enabled. Please reach out to your admin for changing the settings to allow deletion.", targetsLabel);
        } else if (this.hasTargetRelationship()) {
            var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
            result.canDelete = false;
            result.message = gs.getMessage("A {0} cannot be deleted when it has associated work/planning items.", targetLabel);
        }
        return result;
    },

    validateDates: function() {
        var goalLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
        var goalGr = this.getGoalGR();
        goalGr.next();
        var errorMsg = gs.getMessage("The start and end dates must be within the dates ({0} and {1}) of the {2}.", [GlideStringUtil.escapeHTML(goalGr.getDisplayValue('start_date')), GlideStringUtil.escapeHTML(goalGr.getDisplayValue('end_date')), goalLabel]);
        var targetGr = this.getTargetGR();
        var targetStartDate = targetGr.start_date;
        var targetEndDate = targetGr.end_date;
        if (global.JSUtil.notNil(targetStartDate) && global.JSUtil.notNil(targetEndDate) && targetStartDate > targetEndDate) {
            errorMsg = gs.getMessage("Start date cannot be later than the end date.");
            return errorMsg;
        }
        var goalStartDate = goalGr.start_date;
        var goalEndDate = goalGr.end_date;
        if (global.JSUtil.notNil(targetStartDate)) {
            if ((global.JSUtil.notNil(goalStartDate) && goalStartDate > targetStartDate) || (global.JSUtil.notNil(goalEndDate) && goalEndDate < targetStartDate)) {
                return errorMsg;
            }
        }
        if (global.JSUtil.notNil(targetEndDate)) {
            if ((global.JSUtil.notNil(goalStartDate) && goalStartDate > targetEndDate) || (global.JSUtil.notNil(goalEndDate) && goalEndDate < targetEndDate)) {
                return errorMsg;
            }
        }
        if (GlidePluginManager.isActive("com.snc.advanced_goal_framework") && global.JSUtil.notNil(this.targetGR.getValue("breakdown_interval"))) {
            var clearedFields = [];
            if (global.JSUtil.nil(this.targetGR.getValue("start_date")))
                clearedFields.push("Start date");
            if (global.JSUtil.nil(this.targetGR.getValue("end_date")))
                clearedFields.push("End date");
            if (clearedFields.length > 0)
                return gs.getMessage("{0} cannot be empty when the target value breakdown interval is set.", clearedFields.join(" and "));
        }
        return "";
    },

    getNextReviewDate: function(review_due_date, checkinFreq) {
        if (GlidePluginManager.isActive('sn_gfa')) {
            var newReviewDate;

            if (checkinFreq === "daily")
                newReviewDate = new GlideDateTime(review_due_date).getDate();
            else
                newReviewDate = new GlideDateTime(this.getReviewDateForAGivenDateAndCheckInFrequency(review_due_date, checkinFreq)).getDate();

            if (newReviewDate) {
                return newReviewDate;
            }
        }

        return this._getReviewDate(review_due_date, checkinFreq, 1);
    },

    getDateWithoutTimezone: function(systemDate) {
        var dateWithoutTimezone = new GlideDate();
        systemDate.add(systemDate.getTZOffset());
        dateWithoutTimezone.setValue(systemDate.getValue());
        return dateWithoutTimezone;
    },

    getReviewDateForAGivenDateAndCheckInFrequency: function(date, checkInFrequency) {
        var dateGr = new GlideDateTime(date);
        var businessCalendarSpanGR = new GlideRecord('business_calendar_span');
        businessCalendarSpanGR.addQuery("calendar", this.calendarSpanSysIds[checkInFrequency]);
        businessCalendarSpanGR.addQuery("end", ">=", dateGr.getDate());
        businessCalendarSpanGR.orderBy("start");
        businessCalendarSpanGR.setLimit(2);
        businessCalendarSpanGR.query();
        var reviewDate;
        while (businessCalendarSpanGR.next()) {
            if (checkInFrequency === "weekly") {
                reviewDate = new GlideDateTime(businessCalendarSpanGR.getValue("start"));
                reviewDate.addDaysUTC(4);
            } else {
                reviewDate = new GlideDateTime(businessCalendarSpanGR.getValue("end"));
                reviewDate.addDaysUTC(-1);
            }

            if (reviewDate.after(dateGr))
                break;
        }

        return reviewDate.getDate();
    },

    getBusinessCalendarSpanGr: function(breakdownPeriod) {
        var businessCalendarSpanGR = new GlideRecord('business_calendar_span');
        businessCalendarSpanGR.get(breakdownPeriod);

        return businessCalendarSpanGR;
    },

    getReviewDueDateForDailyBreakdown: function() {
        var targetBreakdowns = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        targetBreakdowns.addQuery("target", this.targetId);
        targetBreakdowns.addQuery("period_type", this.targetGR.getValue("check_in_frequency"));
        targetBreakdowns.addNotNullQuery("actual_value");
        targetBreakdowns.orderByDesc("start_date");
        targetBreakdowns.query();

        var reviewDueDate;
        if (targetBreakdowns.next()) {
            reviewDueDate = new GlideDateTime(targetBreakdowns.getValue("start_date"));
            reviewDueDate.addDaysUTC(1);
        } else {
            reviewDueDate = new GlideDateTime(this.targetGR.getValue("start_date"));
        }

        return reviewDueDate;
    },

    getNumberOfMonths: function(startDate, endDate) {
        var numMonths = (endDate.getYearUTC() - startDate.getYearUTC()) * 12;
        numMonths -= startDate.getMonthUTC();
        numMonths += endDate.getMonthUTC();

        return numMonths;
    },

    getOffsetBetweenTwoBreakdownDateForAPeriodType: function(startDate, endDate, periodType) {
        if (periodType !== "weekly")
            return this.getNumberOfMonths(new GlideDateTime(startDate), new GlideDateTime(endDate));
        else
            return GlideDateTime.subtract(new GlideDateTime(startDate), new GlideDateTime(endDate));
    },

    getOffsetToBeAddedOnReviewDate: function(breakdownsWithActualValue, breakdownPeriodToBeUpdated, firstBreakdownEndDate, targetBreakdownOnWhichActualValueIsUpdated) {
        var latestBreakdownWithActualValue = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        var lastButOneBreakdownWithActualValue = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        var offset;
        var currentActualValueIsCleared = global.JSUtil.nil(targetBreakdownOnWhichActualValueIsUpdated.getValue("actual_value"));
        var periodType = targetBreakdownOnWhichActualValueIsUpdated.getValue("period_type");

        if (currentActualValueIsCleared) {
            var startDate = new GlideDateTime(targetBreakdownOnWhichActualValueIsUpdated.getValue("end_date"));
            offset = this.getOffsetBetweenTwoBreakdownDateForAPeriodType(breakdownPeriodToBeUpdated.getValue("start_date"), startDate, periodType);
        } else {
            if (breakdownsWithActualValue.length == 2) {
                latestBreakdownWithActualValue.get(breakdownsWithActualValue[1]);
                lastButOneBreakdownWithActualValue.get(breakdownsWithActualValue[0]);
                offset = this.getOffsetBetweenTwoBreakdownDateForAPeriodType(lastButOneBreakdownWithActualValue.getValue("end_date"), latestBreakdownWithActualValue.getValue("end_date"), periodType);
            } else {
                offset = this.getOffsetBetweenTwoBreakdownDateForAPeriodType(firstBreakdownEndDate, breakdownPeriodToBeUpdated.getValue("end_date"), periodType);
            }
        }

        return periodType === "weekly" ? offset.getRoundedDayPart() : offset;
    },

    getReviewDateFromBreakdownToBeUpdated: function(breakdownPeriodToBeUpdated, breakdownsWithActualValue, firstBreakdownEndDate, targetBreakdownOnWhichActualValueIsUpdated) {
        var businessCalendarSpanGR = this.getBusinessCalendarSpanGr(breakdownPeriodToBeUpdated.getValue("breakdown_period"));
        var offset = this.getOffsetToBeAddedOnReviewDate(breakdownsWithActualValue, breakdownPeriodToBeUpdated, firstBreakdownEndDate, targetBreakdownOnWhichActualValueIsUpdated);
        var reviewDueDate = new GlideDateTime(this.targetGR.getValue("review_due_date"));
        var currentActualValueIsCleared = global.JSUtil.nil(targetBreakdownOnWhichActualValueIsUpdated.getValue("actual_value"));
        var periodType = targetBreakdownOnWhichActualValueIsUpdated.getValue("period_type");

        if (currentActualValueIsCleared) {
            var negOffset = -offset;
            offset = negOffset;
        }

        if (periodType === "weekly")
            reviewDueDate.addWeeksUTC(Math.floor(offset / 7));
        else
            reviewDueDate.addMonthsUTC(offset);

        return reviewDueDate;
    },

    getNewReviewDateBasedOnCheckins: function(targetBreakdownOnWhichActualValueIsUpdated) {
        if (targetBreakdownOnWhichActualValueIsUpdated.getValue("period_type") === "daily")
            return this.getReviewDueDateForDailyBreakdown();

        var currentBreakdownActualValue;
        var previousBreakdownActualValue;
        var breakdownPeriodWithActualValue = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        var breakdownPeriodToBeUpdated = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        var breakdownsWithActualValue = [];
        var firstBreakdownEndDate;
        var firstBreakdownStartDate;

        var targetBreakdowns = new GlideRecord(sn_gfa.GFAdvancedConstants.TARGET_BREAKDOWN_TABLE);
        targetBreakdowns.addQuery("target", this.targetId);
        targetBreakdowns.addQuery("period_type", this.targetGR.getValue("check_in_frequency"));
        targetBreakdowns.orderBy("start_date");
        targetBreakdowns.query();

        while (targetBreakdowns.next()) {
            currentBreakdownActualValue = targetBreakdowns.getValue("actual_value");
            if (currentBreakdownActualValue) {
                breakdownsWithActualValue.push(targetBreakdowns.getUniqueValue());
            }

            if (global.JSUtil.nil(firstBreakdownEndDate)) {
                firstBreakdownStartDate = targetBreakdowns.getValue("start_date");
                firstBreakdownEndDate = targetBreakdowns.getValue("end_date");
            }

            if (global.JSUtil.notNil(previousBreakdownActualValue) && global.JSUtil.nil(currentBreakdownActualValue)) {
                breakdownPeriodToBeUpdated.get(targetBreakdowns.getUniqueValue());
            }

            previousBreakdownActualValue = currentBreakdownActualValue;
        }

        breakdownsWithActualValue = breakdownsWithActualValue.splice(-2);
        breakdownPeriodWithActualValue.get(breakdownsWithActualValue[breakdownsWithActualValue.length - 1]);

        if (breakdownPeriodWithActualValue.isValidRecord() && breakdownPeriodToBeUpdated.isValidRecord()) {
            if (targetBreakdownOnWhichActualValueIsUpdated.start_date >= breakdownPeriodWithActualValue.start_date) {
                return this.getReviewDateFromBreakdownToBeUpdated(breakdownPeriodToBeUpdated, breakdownsWithActualValue, firstBreakdownEndDate, targetBreakdownOnWhichActualValueIsUpdated);
            }
        } else if (targetBreakdownOnWhichActualValueIsUpdated.end_date >= this.targetGR.end_date && global.JSUtil.notNil(targetBreakdownOnWhichActualValueIsUpdated.getValue("actual_value"))) {
            var targetReviewDueDate = new GlideDateTime(this.targetGR.getValue("review_due_date"));
            var periodType = targetBreakdownOnWhichActualValueIsUpdated.getValue("period_type");
            var offset;
            var offsetStartDate = global.JSUtil.notNil(this.targetGR.actual_value) ? breakdownPeriodWithActualValue.getValue("start_date") : firstBreakdownStartDate;
            offset = this.getOffsetBetweenTwoBreakdownDateForAPeriodType(offsetStartDate, targetBreakdownOnWhichActualValueIsUpdated.getValue("end_date"));

            if (periodType === "weekly") {
                targetReviewDueDate.addWeeksUTC(offset.getDayPart() / 7);
            } else {
                targetReviewDueDate.addMonthsUTC(offset);
            }
            return targetReviewDueDate;
        } else {
            if (!breakdownPeriodWithActualValue.isValidRecord())
                return new GlideDateTime(this.getReviewDateForAGivenDateAndCheckInFrequency(this.targetGR.getValue("start_date"), this.targetGR.getValue("check_in_frequency")));
        }
    },

    _getReviewDate: function(target_start_date, checkinFreq, offset) {
        var reviewDate = new GlideDateTime(target_start_date);
        var targetStartDate = new GlideDate();
        targetStartDate.setValue(target_start_date);
        var now = new GlideDateTime();
        var nextCheckInDate;

        switch (checkinFreq) {
            case "daily":
                this._handleDailyCheckIn(now, targetStartDate, reviewDate, offset);
                break;
            case "weekly":
                this._handleWeeklyCheckIn(now, targetStartDate, reviewDate);
                break;
            case "fortnightly":
                this._handleFortnightlyCheckIn(now, target_start_date, reviewDate, offset);
                break;
            case "monthly":
                this._handleMonthlyCheckIn(targetStartDate, reviewDate);
                break;
            case "quarterly":
                this._handleQuarterlyCheckIn(targetStartDate, reviewDate);
                break;
            case "yearly":
                this._handleYearlyCheckIn(targetStartDate, reviewDate);
                break;
        }

        return reviewDate.getDate();
    },

    _handleDailyCheckIn: function(now, targetStartDate, reviewDate, offset) {
        if (now.after(targetStartDate)) {
            now.addDaysUTC(1 * offset);
            reviewDate.setGlideDateTime(now);
        }
    },

    _handleWeeklyCheckIn: function(now, targetStartDate, reviewDate) {
        var nextWeekFriday;
        var thisWeekStartDate = this.getDateWithoutTimezone(new GlideDateTime(gs.beginningOfThisWeek()));
        var currentWeekFriday = new GlideDate();
        currentWeekFriday.setValue(thisWeekStartDate.getValue());
        currentWeekFriday.addDaysUTC(4);

        if (currentWeekFriday.before(targetStartDate) || currentWeekFriday.equals(targetStartDate)) {
            nextWeekFriday = this.calculateFutureCheckInDate(targetStartDate.getValue(), "weekly");
        } else if (currentWeekFriday.before(now.getDate()) || currentWeekFriday.equals(now.getDate())) {
            nextWeekFriday = this.calculateFutureCheckInDate(now.getDate(), "weekly");
        }

        var checkInDate = this.determineCheckInDate(targetStartDate.getValue(), currentWeekFriday, nextWeekFriday);
        reviewDate.setGlideDateTime(checkInDate);
    },

    _handleFortnightlyCheckIn: function(now, target_start_date, reviewDate, offset) {
        var weeks = 1 * offset;
        if (now > target_start_date) {
            var diff = GlideDateTime.subtract(reviewDate, now);
            var days = diff.getRoundedDayPart();
            weeks += Math.floor(days / 14);
        }
        reviewDate.addWeeksUTC(weeks * 2);
    },

    _handleMonthlyCheckIn: function(targetStartDate, reviewDate) {
        var nextMonthEndDate;
        var thisMonthEndDate = new GlideDate();
        thisMonthEndDate.setValue(this.getDateWithoutTimezone(new GlideDateTime(gs.endOfThisMonth())));

        if (thisMonthEndDate.before(targetStartDate) || thisMonthEndDate.equals(targetStartDate)) {
            nextMonthEndDate = this.calculateFutureCheckInDate(targetStartDate.getValue(), "monthly");
        }
        reviewDate.setGlideDateTime(this.determineCheckInDate(targetStartDate.getValue(), thisMonthEndDate, nextMonthEndDate));
    },

    _handleQuarterlyCheckIn: function(targetStartDate, reviewDate) {
        var nextQuarterEndDate;
        var thisQuarterEndDate = new GlideDate();
        thisQuarterEndDate.setValue(this.getDateWithoutTimezone(new GlideDateTime(gs.endOfThisQuarter())));

        if (thisQuarterEndDate.before(targetStartDate) || thisQuarterEndDate.equals(targetStartDate)) {
            nextQuarterEndDate = this.calculateFutureCheckInDate(targetStartDate.getValue(), "quarterly");
        }
        reviewDate.setGlideDateTime(this.determineCheckInDate(targetStartDate.getValue(), thisQuarterEndDate, nextQuarterEndDate));
    },

    _handleYearlyCheckIn: function(targetStartDate, reviewDate) {
        var nextYearEndDate;
        var thisYearEndDate = new GlideDateTime(this.getDateWithoutTimezone(new GlideDateTime(gs.endOfThisYear())));

        if (thisYearEndDate.before(targetStartDate) || thisYearEndDate.equals(targetStartDate)) {
            nextYearEndDate = this.calculateFutureCheckInDate(targetStartDate.getValue(), "yearly");
        }
        reviewDate.setGlideDateTime(this.determineCheckInDate(targetStartDate.getValue(), thisYearEndDate, nextYearEndDate));
    },

    calculateFutureCheckInDate: function(target_start_date, checkInFrequency) {
        var reviewDate;
        var targetStartDate = new GlideDateTime(target_start_date);
		var businessCalendarSpanGR = this.getBusinessCalendarSpanGrBeforeADateAndFrequency(target_start_date, checkInFrequency);

        while (businessCalendarSpanGR.next()) {
            reviewDate = new GlideDateTime(checkInFrequency === "weekly" ? businessCalendarSpanGR.getValue("start") : businessCalendarSpanGR.getValue("end"));
            if (checkInFrequency !== "weekly") {
                reviewDate.addDaysUTC(-1);
            } else {
                reviewDate.addDaysUTC(4);
            }

            if (targetStartDate.compareTo(reviewDate) < 0) {
                break;
            }
        }
        return reviewDate.getDate().getValue();
    },

    determineCheckInDate: function(target_start_date, checkInDate, nextCheckInDate) {
        var now = new GlideDateTime();
        var targetStartDate = new GlideDateTime(target_start_date);
        var nextCheckInDateGDT = new GlideDateTime(nextCheckInDate);

        if (checkInDate.before(now.getDate()) || checkInDate.equals(now.getDate()) || checkInDate.before(targetStartDate)) {
            checkInDate.setValue(nextCheckInDateGDT);
        }
        return checkInDate;
    },

    getBusinessCalendarSpanGrBeforeADateAndFrequency: function(target_start_date, checkInFrequency) {
        var businessCalendarSpanGR = new GlideRecord('business_calendar_span');
        businessCalendarSpanGR.addQuery('calendar', this.calendarSpanSysIds[checkInFrequency]);
        businessCalendarSpanGR.addQuery('end', '>', target_start_date);
        businessCalendarSpanGR.orderBy('start');
		businessCalendarSpanGR.setLimit(2);
        businessCalendarSpanGR.query();

		return businessCalendarSpanGR;
    },

    logTargetProgress: function() {
        new sn_gf.TargetProgressUtil(this.getTargetGR()).logTargetProgress();
    },

    addToTarget: function(target, valueDiff, fieldToUpdate) {
        var initialValue = target.getValue(fieldToUpdate);
        var newValue = Number(initialValue) + valueDiff;
        target.setValue(fieldToUpdate, newValue);
        target.update();
    },

    type: 'GFTarget'
};
