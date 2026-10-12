var TableCleanerRuleManager = Class.create();
TableCleanerRuleManager.prototype = Object.extendsObject(DMRuleConstants, {

    _tableCleanerList: undefined,
    _LOGGER: undefined,
    _dmcUtils: undefined,

    initialize: function() {
        _tableCleanerList = new TableCleanerList();
        _LOGGER = new GSLog("", this.DATA_MANAGEMENT_CONSOLE);
        _dmcUtils = new DMCUtils();
    },

    createOrUpdateRule: function(rule) {
        const gr = new GlideRecord(this.TABLES.SYS_AUTO_FLUSH);
        var isUpdate = JSUtil.notNil(rule.sys_id) && gr.get(rule.sys_id);
        if (!isUpdate) {
            gr.initialize();
        }
        const {
            name,
            description,
            tablename,
            matchfield,
            conditions,
            clean_peripheral,
            clean_audit,
            cascade_delete,
            active
        } = rule;
        const age = _dmcUtils.calculateAgeInSeconds(rule.days, rule.hours, rule.minutes, rule.seconds);

        gr.setValue("name", name);
        gr.setValue("description", description);
        gr.setValue("tablename", tablename);
        gr.setValue("matchfield", matchfield);
        gr.setValue("age", age);
        gr.setValue("conditions", conditions);
        gr.setValue("clean_peripheral", clean_peripheral);
        gr.setValue("clean_audit", clean_audit);
        gr.setValue("cascade_delete", cascade_delete);
        gr.setValue("active", active);
        const sysID = isUpdate ? gr.update() : gr.insert();
        return this._buildResult(gr, sysID);
    },

    getRule: function(sysID) {
        const gr = new GlideRecord(this.TABLES.SYS_AUTO_FLUSH);
        if (gr.get(sysID)) {
            const ageInSeconds = gr.getValue("age");
            const { days, hours, minutes, seconds } = _dmcUtils.transformSecondsToYDH(ageInSeconds);
            return {
                "name": gr.getValue("name") ? gr.getValue("name") : gr.getValue("tablename") + " " + sysID,
                "description": gr.getValue("description"),
                "tablename": gr.getValue("tablename"),
                "matchfield": gr.getValue("matchfield"),
                "age": ageInSeconds,
                "conditions": gr.getValue("conditions"),
                "clean_peripheral": gr.getValue("clean_peripheral") == 0 ? false : true,
                "clean_audit": gr.getValue("clean_audit") == 0 ? false : true,
                "cascade_delete": gr.getValue("cascade_delete") == 0 ? false : true,
                "active": gr.getValue("active") == 0 ? false : true,
                "days": days,
                "hours": hours,
                "minutes": minutes,
                "seconds": seconds,
                "sys_id": sysID,
                "can_delete": gr.canDelete()
            };
        }
    },

    activateRule: function(sysID, isActive) {
        const gr = new GlideRecord(this.TABLES.SYS_AUTO_FLUSH);
        if (gr.get(sysID)) {
            gr.setValue("active", isActive);
            gr.update();
        }
    },

    isCleanupEligible: function(tableName) {
        return _tableCleanerList.process().includes(tableName);
    },

    _buildResult: function(gr, sysID) {
        if (!sysID) {
            const errMsgs = gs.getErrorMessages();
            _LOGGER.logErr(errMsgs);
            return {
                status: this.STATUS.ERROR,
                messages: errMsgs
            };
        }
        return {
            sysID: sysID,
            status: this.STATUS.SUCCESS
        };
    },

    deleteRule: function(sysId) {
        let status = _dmcUtils.deleteRecord(this.TABLES.SYS_AUTO_FLUSH, sysId);
        return {
            status: status ? this.STATUS.SUCCESS : this.STATUS.ERROR,
			message: gs.getMessage("The rule has been deleted successfully.")
        };
    },

    type: 'TableCleanerRuleManager'
});
