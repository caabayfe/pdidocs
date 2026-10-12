var ArchiveDestroyRuleManager = Class.create();
ArchiveDestroyRuleManager.prototype = Object.extendsObject(DMRuleConstants, {

    _dmcUtils: undefined,

    initialize: function() {
        _dmcUtils = new DMCUtils();
    },

    createOrUpdateDestroyRule: function(rule) {
        const destroyRuleId = rule.destroy_rule;
        const {
            activate_destroy,
            days_destroy_duration,
            hours_destroy_duration,
            minutes_destroy_duration,
            seconds_destroy_duration,
            destroy_related
        } = rule;
        const destroyRuleRecord = new GlideRecord(this.TABLES.SYS_ARCHIVE_DESTROY);
        const isUpdate = JSUtil.notNil(destroyRuleId) && destroyRuleRecord.get(destroyRuleId);
        if (!isUpdate) {
            destroyRuleRecord.initialize();
        }
        const archiveRuleSysId = rule.sys_id;
        if (!archiveRuleSysId) {
            return;
        }
        destroyRuleRecord.setValue("archive", archiveRuleSysId);
        destroyRuleRecord.setValue("table", "ar_" + rule.table);
        destroyRuleRecord.setValue("name", gs.getMessage("Destroy rule for {0}", rule.table));
        destroyRuleRecord.setValue("description", gs.getMessage("Destroy archived records for {0}", rule.table));
        destroyRuleRecord.setValue("destroy_related", destroy_related);
        destroyRuleRecord.setValue("active", activate_destroy);
        const duration = this.getDuration(days_destroy_duration, hours_destroy_duration, minutes_destroy_duration, seconds_destroy_duration);
        destroyRuleRecord.setValue("archive_duration", duration);
        const updatedDestroyRuleId = isUpdate ? destroyRuleRecord.update() : destroyRuleRecord.insert();
        const response = this.buildResult(updatedDestroyRuleId);
        return response;
    },

    calculateDestoryEstimate: function(destroyRuleId, daysDestroyDuration, hoursDestroyDuration, minutesDestroyDuration, secondsDestroyDuration) {
        var destroyStatus = new GlideArchiveDestroyStatus(destroyRuleId);
        //TODO: Handle destory duration cases like negative number
        const duration = this.getDuration(daysDestroyDuration, hoursDestroyDuration, minutesDestroyDuration, secondsDestroyDuration);
        destroyStatus.setEstimate(destroyRuleId, duration);

        const destoryRule = new GlideRecordSecure(this.TABLES.SYS_ARCHIVE_DESTROY);
        destoryRule.get(destroyRuleId);
        const recordEstimate = destoryRule.getValue(this.ARCHIVE_DESTROY_COLUMNS.RECORD_ESTIMATE);
        const estimateDate = new GlideDateTime(destoryRule.getValue(this.ARCHIVE_DESTROY_COLUMNS.ESTIMATE_DATE)).getDisplayValue();

        return {
            recordEstimate,
            estimateDate
        };
    },

    deleteDestroyRule: function(sys_id) {
        const destroyDelete = new GlideRecord(this.TABLES.SYS_ARCHIVE_DESTROY);
        if (destroyDelete.get(sys_id)) {
            destroyDelete.deleteRecord();
            return {
                status: this.STATUS.SUCCESS
            };
        }
    },

    getDestroyRule: function(sysId) {
        let destroyRuleRecord = new GlideRecord(this.TABLES.SYS_ARCHIVE_DESTROY);
        if (destroyRuleRecord.get(sysId)) {
            let days, hours, minutes, seconds;
            if (destroyRuleRecord.getValue("archive_duration")) {
                const ageInSeconds = new GlideDateTime(destroyRuleRecord.getValue("archive_duration")).getNumericValue() / 1000;
                ({ days, hours, minutes, seconds } = _dmcUtils.transformSecondsToYDH(ageInSeconds));
            }
            let estimateDate = destroyRuleRecord.getValue("estimate_date") ? new GlideDateTime(destroyRuleRecord.getValue("estimate_date")).getDisplayValue() : "";

            return {
                "destroy_rule": sysId,
                "destroy_related": destroyRuleRecord.getValue("destroy_related") == "1" ? true : false,
                "activate_destroy": destroyRuleRecord.getValue("active") == "1" ? true : false,
                "days_destroy_duration": days,
                "hours_destroy_duration": hours,
                "minutes_destroy_duration": minutes,
                "seconds_destroy_duration": seconds,
                "destroy_archive_estimate": destroyRuleRecord.getValue("record_estimate"),
                "destroy_archive_estimate_date": estimateDate,
                "enable_data_destroy": true
            };
        }
        return {
            "activate_destroy": false,
            "destroy_related": false,
            "days_destroy_duration": 0,
            "hours_destroy_duration": 0,
            "minutes_destroy_duration": 0,
            "seconds_destroy_duration": 0,
            "destroy_estimate_date": "",
            "destroy_record_estimate": "",
            "destroy_rule": null
        };
    },

    getDuration: function(days, hours, minutes, seconds) {
        const duration = new GlideDuration(0);
        const totalSeconds = _dmcUtils.calculateAgeInSeconds(days, hours, minutes, seconds);
        duration.addSeconds(totalSeconds);
        return duration;
    },

    buildResult: function(sysId) {
        if (!sysId) {
            return {
                status: this.STATUS.ERROR,
                messages: gs.getErrorMessages()
            };
        }
        return {
            sysID: sysId,
            status: this.STATUS.SUCCESS,
            messages: gs.getInfoMessages()
        };
    },

    type: 'ArchiveDestroyRuleManager'
});
