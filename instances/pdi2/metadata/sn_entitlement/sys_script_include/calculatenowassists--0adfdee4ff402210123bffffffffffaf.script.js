var CalculateNowAssists = Class.create();
CalculateNowAssists.prototype = {
    initialize: function() {
        this._logSourceName = `sn_entitlement.${this.type}`;
        this.genAiUsageLog = new sn_entitlement.SysGenAiUsageLogDao();
        this.assistsSkills = new sn_entitlement.NowAssistsSkillsDao();
        this.assistsDomains = new sn_entitlement.NowAssistsDomainsDao();
        this.assistsProcessor = new AssistsProcessor();
    },

    process: function() {
        this.insertData();
        //populate sn_entitlement_genai_assist_counts
        this.assistsProcessor.populateAssistCounts(); //todo remove both calls to assistsProcessor

        //populate sn_entitlement_genai_assist_analytics with today's account level assist aggregation
        this.assistsProcessor.populateAssistAnalytics();
    },

    insertData: function() {
        const currentDate = new GlideDateTime();

        const yesterday = new GlideDateTime(currentDate);
        yesterday.addDaysLocalTime(-1); // Set to the previous day
        yesterday.setValue(yesterday.getDate() + " 23:59:59"); // Set to the end of yesterday

        let lookback = 1;
        const yesterdaySkillsData = this.genAiUsageLog.getAllNowAssistInfoByGroup(yesterday, lookback, "feature");
        this.assistsSkills.insertSkillsData(yesterdaySkillsData, lookback, currentDate);
        //calculate the lookback period based on the reset date
        const lookbackStartDate = this._getLookbackDate(currentDate);
        if (global.JSUtil.nil(lookbackStartDate)) {
            //customer has no assist entitlements
            return;
        }
        const lookbackType = 365;

        const allSkillsData = this.genAiUsageLog.getAllNowAssistInfoByGroupWithStartDate(currentDate, lookbackStartDate, "feature");
        this.assistsSkills.insertSkillsData(allSkillsData, lookbackType, currentDate);

        if (this.assistsDomains.doesDomainTableExist()) {
            var allDomainData = this.genAiUsageLog.getAllNowAssistInfoByGroupWithStartDate(currentDate, lookbackStartDate, "sys_domain"); // Fetch all domain assist data
            this.assistsDomains.insertDomainData(allDomainData, currentDate);
        }
    },

    _getLookbackDate: function(currentDate) {
        let resetDate = null;
        const resetSKUStartDate = new SubscriptionEntitlementDAO()._getResetSKUStartDate();
        if (resetSKUStartDate) { //$0 Reset SKU exists
            resetDate = new GlideDateTime(resetSKUStartDate);
            gs.setProperty(LicensingEngineConstants.PROP_ASSIST_USAGE_RESET_DATE, resetDate.getValue());
        } else {
            //use reset date stored in property if it exists
            const propResetDate = gs.getProperty(LicensingEngineConstants.PROP_ASSIST_USAGE_RESET_DATE);
            if (global.JSUtil.nil(propResetDate)) {
                //the property is empty, use earliest assist entitlement start date
                const earliestStartDate = new AccountNowAssistPurchasedDao()._getEarliestAssistEntStartDate();
                if (global.JSUtil.nil(earliestStartDate))
                    return null;
                resetDate = earliestStartDate;
                gs.setProperty(LicensingEngineConstants.PROP_ASSIST_USAGE_RESET_DATE, resetDate.getValue());
            } else {
                resetDate = new GlideDateTime(propResetDate);
            }
        }
        return this._calculateLookbackStartDate(resetDate, currentDate);
    },

    _calculateLookbackStartDate: function(resetDate, currentDate) {
        const resetDateObj = new GlideDateTime(resetDate);
        const resetMonth = parseInt(resetDateObj.getMonthUTC());
        const resetDay = parseInt(resetDateObj.getDayOfMonthUTC());
        const currentDateObj = new GlideDateTime(currentDate);
        const currentMonth = parseInt(currentDateObj.getMonthLocalTime());
        const currentDay = parseInt(currentDateObj.getDayOfMonthLocalTime());
        const currentYear = parseInt(currentDateObj.getYearLocalTime());
        let lookbackYear;
        if (resetMonth < currentMonth || (resetMonth === currentMonth && resetDay <= currentDay)) {
            // if reset date comes before current date in the calendar year, use current year
            lookbackYear = currentYear;
        } else {
            // if reset date is on or after the current date in the calendar year, use previous year
            lookbackYear = currentYear - 1;
        }
        let lookbackMonth = resetMonth;
        let lookbackDay = resetDay;
        if (lookbackMonth === 2 && lookbackDay === 29) {
            if (!this._isLeapYear(lookbackYear)) {
                //if the lookback start date is leap day 2/29, change it to 3/1 if the lookback year is not a leap year
                lookbackMonth = 3;
                lookbackDay = 1;
            }
        }
        const lookbackStartDate = new GlideDateTime();
        lookbackStartDate.setDisplayValue(lookbackYear + '-' +
            this._padZero(lookbackMonth) + '-' +
            this._padZero(lookbackDay) + ' 00:00:00');
        return lookbackStartDate;
    },

    _isLeapYear: function(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },

    _padZero: function(num) {
        return num < 10 ? '0' + num : '' + num;
    },

    type: 'CalculateNowAssists'
};
