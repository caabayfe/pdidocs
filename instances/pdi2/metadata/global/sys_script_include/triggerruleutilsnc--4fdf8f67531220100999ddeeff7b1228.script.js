var TriggerRuleUtilSNC = Class.create();

TriggerRuleUtilSNC.LOG_PROPERTY = 'com.snc.trigger_rules.log.level';

TriggerRuleUtilSNC.prototype = {
    initialize: function() {
        this._log = new GSLog(TriggerRuleUtilSNC.LOG_PROPERTY, this.type);
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[initialize] initialize: " + this.type);
    },

    TRIGGER_RULE_TABLE_CFG: 'trigger_rule_table_cfg',
    GROUP_FIELD: 'group_field',
    USER_FIELD: 'user_field',
    TASK: 'task',
    ASSIGNMENT_GROUP: 'assignment_group',
    ASSIGNED_TO: 'assigned_to',
    TABLE: 'table',

    getDefaultGroupField: function(tablename) {
        if (this._extendsTask(tablename))
            return this.ASSIGNMENT_GROUP;

        return tablename ? this._getFieldName(tablename, this.GROUP_FIELD) : this.ASSIGNMENT_GROUP;
    },

    getDefaultUserField: function(tablename) {
        if (this._extendsTask(tablename))
            return this.ASSIGNED_TO;

        return tablename ? this._getFieldName(tablename, this.USER_FIELD) : this.ASSIGNED_TO;
    },

    getTriggerConfigSysId: function(tablename) {
        var gr = this._getTriggerConfigGr(tablename);
        if (gr && gr.next())
            return gr.getUniqueValue();

        return null;
    },

    _extendsTask: function(tablename) {
        return (tablename && GlideDBObjectManager.get().isInstanceOf(tablename, this.TASK));
    },

    _getFieldName: function(tablename, field) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[getDefaultGroupField] tablename: " + tablename + " field: " + field);

        if (!tablename)
            return null;

        var fieldName;
        var gr = this._getTriggerConfigGr(tablename);
        if (gr && gr.next())
            fieldName = gr.getValue(field);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_getFieldName] fieldName: " + fieldName);

        return fieldName;
    },

    _getTriggerConfigGr: function(tablename) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_getTriggerConfigGr] tablename: " + tablename);

        if (!tablename)
            return null;

        var gr = new GlideRecord(this.TRIGGER_RULE_TABLE_CFG);
        gr.addQuery(this.TABLE, tablename);
        gr.addActiveQuery();
        gr.setLimit(1);
        gr.query();

        return gr;
    },

    getTriggerScriptAnnotation: function() {
        return gs.getMessage("Please contact System Administrator to modify Trigger script");
    },

    getTriggerFieldsChoiceListByTable: function(tableName) {
        var fieldChoices = new GlideChoiceList();
        fieldChoices.add("", gs.getMessage('-- None --'));
        var triggerFields = 'assignment_group,priority'; // Default in case the trigger rule record is not configured or trigger condition fields are not populated during an upgrade scenario

        var triggerRuleConfigGr = this._getTriggerConfigGr(tableName);
        if (triggerRuleConfigGr && triggerRuleConfigGr.next()) {
            if (!gs.nil(triggerRuleConfigGr.getValue('trigger_condition_fields'))) {
                triggerFields = triggerRuleConfigGr.getValue('trigger_condition_fields');
            }
        }

        if (triggerFields) {
            triggerFields = triggerFields.split(',');
            var tableGr = new GlideRecord(tableName);
            for (var i = 0; i < triggerFields.length; i++) {
                if (gs.hasRole('rota_admin') || triggerFields[i] !== this.getDefaultGroupField(tableName)) {
                    var element = tableGr.getElement(triggerFields[i]);
                    fieldChoices.add(triggerFields[i], element.getLabel());
                }
            }
        }
        return fieldChoices;
    },

    getTriggerFieldsChoiceList: function(gr /* trigger_rule GlideRecord */ ) {
        return this.getTriggerFieldsChoiceListByTable(gr.getValue('table'));
    },

    escapeHTML: function(text) {
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
    },

    isTriggerGroupFieldPresent: function(triggerRuleGr) {
        var groupFieldName = this.getDefaultGroupField(triggerRuleGr.getValue('table'));
        var triggerFields = triggerRuleGr.getValue('trigger_fields');

        if (triggerFields && groupFieldName) {
            triggerFields = (triggerFields + "").split(',');
            return triggerFields.includes(groupFieldName);
        }
        return false;
    },

    type: 'TriggerRuleUtilSNC'
};
