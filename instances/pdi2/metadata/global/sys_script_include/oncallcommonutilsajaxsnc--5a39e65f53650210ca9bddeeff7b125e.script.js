var OnCallCommonUtilsAjaxSNC = Class.create();

OnCallCommonUtilsAjaxSNC.whitelistedSessionProperties = ['dismiss_new_sow_ui_alert'];

OnCallCommonUtilsAjaxSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getSessionProperty: function() {
        var propertyName = this.getParameter('sysparm_property_name');
        if (OnCallCommonUtilsAjaxSNC.whitelistedSessionProperties.indexOf(propertyName + "") == -1) return null;
        return gs.getSession().getClientData(propertyName);
    },

    putSessionProperty: function() {
        var propertyName = this.getParameter('sysparm_property_name');
        if (OnCallCommonUtilsAjaxSNC.whitelistedSessionProperties.indexOf(propertyName + "") == -1) return;
        var propertyValue = this.getParameter('sysparm_property_value');
        gs.getSession().putClientData(propertyName, propertyValue);
    },

    isSOWOnCallInstalled: function() {
        return (GlidePluginManager.isActive('com.snc.sow_on_call') ? "true" : "false");
    },

    showSOWAnnouncementMsgOnCalendar: function() {
        if (!new OCCalendarUtils().canRead()) return "false";
        return this.showSOWAnnouncementMsg();
    },

    showSOWAnnouncementMsgOnCreationWizard: function() {
        if (!new OnCallSecurityNG().rotaMgrAny()) return "false";
        return this.showSOWAnnouncementMsg();
    },

    showSOWAnnouncementMsg: function() {
        if (this.isSOWOnCallInstalled() != "true") return "false";
        if (!gs.hasRole("sn_sow.sow_user")) return "false";
        if (gs.getProperty('com.snc.on_call.announcement_message', "false") != "true") return "false";
        if (gs.getSession().getClientData("dismiss_new_sow_ui_alert") == "true") return "false";
        return "true";
    },

    getTriggerFieldsChoiceList: function() {
        var tableName = this.getParameter('sysparm_table_name');
        var triggerRule = new GlideRecord('trigger_rule');
        if (!triggerRule.canRead()) {
            return [];
        }
        var tru = new TriggerRuleUtil();
        var choiceListObj = tru.getTriggerFieldsChoiceListByTable(tableName);
        var choiceListSize = choiceListObj.getSize();
        var choices = [];
        for (var i = 0; i < choiceListSize; i++) {
            var choice = choiceListObj.getChoice(i);
            choices.push({
                "label": tru.escapeHTML(choice.getLabel() + ''),
                "value": choice.getValue() + ''
            });
        }
        return JSON.stringify(choices);
    },

    isTriggerGroupFieldPresent: function() {
        var tableName = this.getParameter('sysparm_table_name');
        var triggerFields = this.getParameter('sysparm_trigger_fields');
        var triggerRuleGr = new GlideRecord('trigger_rule');
        triggerRuleGr.newRecord();
        if (!triggerRuleGr.canRead()) {
            return false;
        }
        var tru = new TriggerRuleUtil();
        var groupFieldName = tru.getDefaultGroupField(tableName);
        if (triggerFields && groupFieldName) {
            triggerFields = (triggerFields + "").split(',');
            return triggerFields.includes(groupFieldName);
        }
        return false;
    },

    type: 'OnCallCommonUtilsAjaxSNC'
});
