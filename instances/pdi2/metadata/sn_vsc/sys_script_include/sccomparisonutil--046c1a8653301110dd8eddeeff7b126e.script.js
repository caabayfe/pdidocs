var SCComparisonUtil = Class.create();
SCComparisonUtil.prototype = {
    constants: new sn_vsc.SecurityCenterConstants(),
    initialize: function() {},

    /*
     *
     *Input params (date1 = first comparison date)
     *Input params (date2 = second comparison date)
     *Create new comparison and associate it with logged in user
     */
    compareWithUserId: function(date1, date2) {
        var compare = this.createUserComparison(date1, date2, gs.getUserID(), false);
        // Convert local dates to UTC dates. The event will be picked up by System, so TZ will be lost.
        var time1UTC = this._convertUserDateToUTCStart(date1);
        var time2UTC = this._convertUserDateToUTCEnd(date2);
        var paramList = compare + ',' + time1UTC + ',' + time2UTC;
        gs.eventQueue('sn_vsc.sec.hardening.comparison', null, 'sn_vsc_changed_hardening_settings', paramList);
    },

    _convertUserDateToUTCEnd: function(date) {
        return this._convertUserDateTimeToUTC(date + ' 23:59:59');
    },

    _convertUserDateToUTCStart: function(date) {
        return this._convertUserDateTimeToUTC(date + ' 00:00:00');
    },

    /**
     * Input params (dateTime = the date and time string in local time for user)
     * Must be ran as the user, not System
     */
    _convertUserDateTimeToUTC: function(dateTime) {
        var timeUTC = new GlideDateTime(dateTime);
        timeUTC.subtract(timeUTC.getTZOffset());
        return timeUTC.getUTCValue();
    },

    /*
     *
     *Input params (timeStamp1 = first comparison timeStamp, start of day in UTC)
     *Input params (timeStamp2 = second comparison timeStamp, end of day in UTC)
     *Runs new comparison against given timeStamps
     */
    runComparison: function(timeStamp1, timeStamp2) {
        // This is ran by system, so the inputs must be in UTC
        var settings = [];
        var tableRec = new GlideAggregate("sn_vsc_updated_settings");
        tableRec.addQuery('u_setting', '!=', 'NULL');
        var lastCollectionTime1 = this._getLastScoreTimestamp(timeStamp1);
        tableRec.addQuery('sys_created_on', '>=', lastCollectionTime1);
        tableRec.addQuery('sys_created_on', '<=', timeStamp2);
        tableRec.groupBy("u_setting");
        tableRec.query();
        while (tableRec.next()) {
            settings.push(tableRec.u_setting.sys_id);
        }
        return settings;
    },

    _getLastScoreTimestamp: function(utcDateTime) {
        var dateStart = new GlideDateTime(utcDateTime);
        var dateEnd = new GlideDateTime(utcDateTime);
        dateEnd.addDaysUTC(1);
        var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
        gr.setLimit(1);
        gr.orderByDesc('harc_collected');
        gr.addQuery('harc_collected', '>=', dateStart.getUTCValue());
        gr.addQuery('harc_collected', '<', dateEnd.getUTCValue());
        gr.query();
        gr.next();
        return gr.harc_collected;
    },

    //Runs every time new score is generated, captures new score
    recordComplianceScore: function() {
        var score = this.getComplianceScore().toString();
        var gr = new GlideRecord('pa_job_logs');
        gr.addQuery('job', this.constants.SCPAJob);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
            var grC = new GlideRecord('sn_vsc_hardening_compliance_scores');
            grC.orderByDesc('harc_collected');
            grC.query();
            if (grC.next()) {
                var jobDate = new GlideDateTime(gr.sys_created_on).getDisplayValue();
                if (jobDate.split(" ")[0] == grC.harc_collected.getDisplayValue().split(" ")[0]) {
                    grC.harc_score = score;
                    grC.harc_collected = new GlideDateTime(gr.sys_created_on).getDisplayValue();
                    grC.harc_compliant = this.getNonCompliant();
                    grC.update();
                    return;
                } else {
                    this.insertScore(new GlideDateTime(gr.sys_created_on).getDisplayValue(), score, this.getNonCompliant());
                    return;
                }

            } else {
                this.insertScore(new GlideDateTime(gr.sys_created_on).getDisplayValue(), score, this.getNonCompliant());
                return;
            }
        }
    },

    //Insert new score collection
    insertScore: function(createdOn, score, compliance) {
        var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
        gr.initialize();
        gr.harc_collected = createdOn;
        gr.harc_score = score;
        gr.harc_compliant = compliance;
        gr.insert();
    },

    //Get latest score on indicator using PAScorecard api
    getComplianceScore: function() {
        var sc = new global.PAScorecard();
        sc.addParam('uuid', 'c725162518678110f877e53e0f01871f');
        var result = sc.query();
        return (result.length > 0) ? result[0].value_formatted : '';
    },

    //Get indicator id
    getId: function(indicatorSysId) {
        var gr = new GlideRecord('pa_indicators');
        gr.addQuery('sys_id', indicatorSysId);
        gr.query();
        if (gr.next()) {
            return gr.id;
        }
    },

    //Get total non-compliant settings
    getNonCompliant: function() {
        var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
        gr.addQuery('compliance_status', 'non-compliant');
        gr.query();
        return gr.getRowCount();
    },

    /*
     *
     *Create new comparison for most recent Job run
     */
    defaultComparison: function() {
        var gr = new GlideRecord('pa_job_logs');
        gr.addQuery('job', this.constants.SCPAJob);
        gr.orderByDesc('sys_created_on');
        gr.query();
        var dates = [];
        while (gr.next() && dates.length < 2) {
            var jobDate = new GlideDateTime(gr.sys_created_on).getLocalDate().toString();
            if (dates.length == 0 || dates[0] != jobDate) {
                dates.push(jobDate);
            }
        }
        if (dates.length == 2 && dates[1] != null && dates[0] != null) {
            var currDate = new GlideDateTime().getLocalDate();
            var users = "";
            if (dates[0] == currDate) {
                var gComp = new GlideRecord("sn_vsc_user_comparisons");
                gComp.addQuery('usr_name', 'CONTAINS', currDate);
                gComp.query();
                while (gComp.next()) {
                    if (gComp.usr_name.split(",")[1] == currDate) {
                        users += gComp.usr_list.toString();
                        gComp.deleteRecord();
                    }
                }
                var gSet = new GlideRecord("sn_vsc_changed_hardening_settings");
                gSet.addEncodedQuery('set_comp=NULL');
                gSet.query();
                gSet.query();
                while (gSet.next()) {
                    gSet.deleteMultiple();
                }
                this.updateDefaultState();
                var compa = this.createUserComparison(dates[1], dates[0], users, true);
                var param = compa + ',' + this._convertUserDateToUTCStart(dates[1]) + ',' + this._convertUserDateToUTCEnd(dates[0]);
                gs.eventQueue('sn_vsc.sec.hardening.comparison', null, 'sn_vsc_changed_hardening_settings', param);
            } else {
                this.updateDefaultState();
                var com = this.createUserComparison(dates[1], dates[0], " ", true);
                var paramList = com + ',' + this._convertUserDateToUTCStart(dates[1]) + ',' + this._convertUserDateToUTCEnd(dates[0]);
                gs.eventQueue('sn_vsc.sec.hardening.comparison', null, 'sn_vsc_changed_hardening_settings', paramList);
            }
        }
    },

    //Set default state on previous default comparison
    updateDefaultState: function() {
        var gU = new GlideRecord("sn_vsc_user_comparisons");
        gU.addQuery('usr_default', true);
        gU.query();
        while (gU.next()) {
            gU.usr_default = false;
            gU.update();
        }
    },

    /*
     *
     *Input params (timeStamp1 = first comparison timeStamp)
     *Input params (timeStamp2 = second comparison timeStamp)
     *Check if comparison already exist, update user assignment respectively
     */
    lookForComparison: function(timeStamp1, timeStamp2) {
        if (timeStamp1 != null && timeStamp2 != null) {
            var compId = timeStamp1 + "," + timeStamp2; //need to handle reverse comparision
            var grUser = new GlideRecord("sn_vsc_user_comparisons");
            grUser.addQuery('usr_name', compId);
            grUser.query();
            if (grUser.next()) { //Comparison found
                if (!grUser.usr_list.toString().includes(gs.getUserID())) {
                    this.removeUserFromComparisons(gs.getUserID());
                    if (grUser.usr_list.toString() != '') {
                        grUser.usr_list = grUser.usr_list.toString() + ',' + gs.getUserID();
                    } else {
                        grUser.usr_list = gs.getUserID();
                    }
                    grUser.update();
                }
            } else { //Comparison not found
                this.compareWithUserId(timeStamp1, timeStamp2);
            }
        }
    },

    /*
     *
     *Remove user associated to comparision
     */
    removeUserFromComparisons: function(userId) {
        var gr = new GlideRecord("sn_vsc_user_comparisons");
        var eQ = "usr_listLIKE" + userId;
        gr.addEncodedQuery(eQ);
        gr.query();
        while (gr.next()) {
            var Uarr = gr.usr_list.split(",");
            var index = Uarr.indexOf(userId.toString());
            if (index !== -1) {
                Uarr.splice(index, 1);
            }
            gr.usr_list = Uarr.toString();
            gr.update();
        }
    },

    /*
     *
     *Input params (timeStamp1 = first comparison timeStamp)
     *Input params (timeStamp2 = second comparison timeStamp)
     *Create new comparison and associate it with given user
     */
    createUserComparison: function(timeStamp1, timeStamp2, userId, isDefault) {
        if (timeStamp1 != "" && timeStamp1 != null && timeStamp2 != "" && timeStamp2 != null) {
            if (userId != " ") {
                this.removeUserFromComparisons(gs.getUserID());
            }
            var grUser = new GlideRecord("sn_vsc_user_comparisons");
            grUser.initialize();
            grUser.setValue("usr_name", timeStamp1 + "," + timeStamp2);
            grUser.setValue("usr_default", isDefault);
            if (userId != "") {
                grUser.setValue("usr_list", userId);
            }
            grUser.setValue("usr_status", "progress");
            return grUser.insert();
        }
    },

    /*
     *
     *Input params (compare = reference to user comparison record)
     *Input params (settings = list of changed settings)
     *Associate chnaged settings to comparison
     */
    createChangedSettings: function(compare, settings) {
        for (var stg in settings) {
            var chgSetting = new GlideRecord("sn_vsc_changed_hardening_settings");
            chgSetting.initialize();
            chgSetting.setValue("set_comp", compare);
            chgSetting.setValue("set_setting", settings[stg]);
            chgSetting.insert();
        }
    },

    /*
     *
     *Assign default comparison upon login for admin users
     */
    loginEvent: function(uId) {
        var gC = new GlideRecord("sn_vsc_user_comparisons");
        gC.query();
        if (gC.getRowCount() > 0) {
            this.removeUserFromComparisons(uId);
        }
    },


    /*
     *
     * Returns most repeated security area in number of settings changed 
     */
    mostRepeatedSecurityArea: function(currScoreDate, prevScoreDate) {
        var resultArea = {};
        var securityArea = {};
        var mostRepeatedSecurityArea = '';
        var settingsRecord = this.getUpdatedSettings(currScoreDate, prevScoreDate);
        while (settingsRecord.next()) {
            var secArea = settingsRecord.u_setting.security_check_category.getDisplayValue();
            if (resultArea[secArea]) {
                resultArea[secArea]++;
            } else {
                // otherwise, add the word to the result object with a count of 1
                resultArea[secArea] = 1;
            }
        }

        if (resultArea) {
            // Create items array
            var items = Object.keys(resultArea).map(function(key) {
                return [key, resultArea[key]];
            });

            // Sort the array based on the second element
            items.sort(function(first, second) {
                return second[1] - first[1];
            });

            // Create a new array with only the first 3 items
            var slicedArray = items.slice(0, 3);
            securityArea = slicedArray.map(function(area) {
                return area[0];
            });
        }


        return securityArea;
    },

    /*
     *
     * Returns most repeated priority for the security area in number of settings changed 
     */
    getAllPriorityForSecurityArea: function(securityArea, currScoreDate, prevScoreDate) {
        var mostRepeatedSecurityAreaArray = securityArea;
        var mostRepeatedPriority = '';
        var resultPriority = {};
        var settingsRecord = this.getUpdatedSettings(currScoreDate, prevScoreDate);
        while (settingsRecord.next()) {
            var secArea = settingsRecord.u_setting.security_check_category.getDisplayValue();
            for (var i = 0; i < mostRepeatedSecurityAreaArray.length; i++) {
                if (secArea == mostRepeatedSecurityAreaArray[i]) {
                    var priority = settingsRecord.u_setting.check.priority.getDisplayValue();
                    if (resultPriority[priority]) {
                        resultPriority[priority]++;
                    } else {
                        // otherwise, add the word to the result object with a count of 1
                        resultPriority[priority] = 1;
                    }

                }
            }
        }

        return resultPriority;

    },

    getUpdatedSettings: function(currScoreDate, prevScoreDate) {
        var encodedQuery = "";
        if (currScoreDate != prevScoreDate) {
            encodedQuery = "u_setting!=NULL^sys_created_on>javascript:gs.dateGenerate('" + prevScoreDate.split(' ')[0] + "','23:59:59')";
            var grSettings = new GlideAggregate('sn_vsc_updated_settings');
            grSettings.addEncodedQuery(encodedQuery, true);
            grSettings.groupBy('u_setting');
            grSettings.query();
            return grSettings;
        }
    },

    getUpdatedSettingsBetweenTimes: function(currScoreDateTime, prevScoreDateTime) {
        var grSettings = new GlideAggregate('sn_vsc_updated_settings');
        grSettings.addQuery('u_setting', '!=', null);
        grSettings.addQuery('sys_created_on', '>=', prevScoreDateTime);
        grSettings.addQuery('sys_created_on', '<', currScoreDateTime);
        grSettings.groupBy('u_setting');
        grSettings.query();
        return grSettings;
    },

    getScoreTrendDates: function() {
        var startDate = new GlideDateTime();
        var currDate = new GlideDateTime();
        var endDate = new GlideDateTime();
        var gr = new GlideRecord('sn_vsc_hardening_compliance_scores');
        gr.addEncodedQuery('harc_score!=0');
        gr.orderBy('harc_collected');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            startDate = new GlideDateTime(gr.getValue('harc_collected'));
        }
        var startYear = startDate.getYearLocalTime();
        var currYear = currDate.getYearLocalTime();

        if (currYear - startYear > 1) {
            startDate.setYear(currYear - 1);
        }
        return [{
            "startDate": startDate.getDisplayValueInternal().split(" ")[0],
            "endDate": endDate.getDisplayValueInternal().split(" ")[0]
        }];
    },
    type: 'SCComparisonUtil'
};
