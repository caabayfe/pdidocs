(function() {
    if (event.parm1) {
        var CHANNEL_ANALYTICS = 'catalog_channel_analytics';
        var TABLE_NAME = 'table_name';
        var DOCUMENT_KEY = 'document_key';
        var CATALOG_ITEM = 'catalog_item';
        var TASK_ID = 'task_id';
        var ENGAGEMENT_CHANNEL = 'engagement_channel';
        var REFERRER = 'referrer';
        var ORDER_GUIDE = 'order_guide';
        var METHOD = 'method';
        var REQUESTED_FOR = 'requested_for';
		var CONVERSATION = 'conversation';

        var CREATE_METHOD = 'create';
        var EDIT_METHOD = 'edit';

        var DEFAULT = 'default';
        var FULFILLMENT_AUTOMATION_LEVEL = 'fulfillment_automation_level';
        var UNSPECIFIED = 'unspecified';
        var params = null;
        try {
            params = JSON.parse(event.parm1);
        } catch (e) {
            gs.log('Error while parsing parm1 for catalog_channel_analytics: ' + e);
        }

        if (!params || !params.table_name || !params.catalog_item || (params.table_name != 'sc_cat_item_guide' && !params.document_key))
            return;

        var currentMethod;

        if (params.table_name == 'sc_cat_item_guide' && !params.document_key)
            currentMethod = CREATE_METHOD;
        else {
            // We might be trying to edit an item using a CRP which was created earlier by another CRP
            var gr = new GlideRecord(CHANNEL_ANALYTICS);
            gr.addQuery(TABLE_NAME, params[TABLE_NAME]);
            gr.addQuery(DOCUMENT_KEY, params[DOCUMENT_KEY]);
            gr.addQuery(METHOD, CREATE_METHOD);
            gr.setWorkflow(false);
            gr.query();
            if (!gr.hasNext())
                currentMethod = CREATE_METHOD;
            else
                currentMethod = EDIT_METHOD;
        }

        gr = new GlideRecord(CHANNEL_ANALYTICS);
        gr.initialize();
        gr.setValue(TABLE_NAME, params[TABLE_NAME]);
        gr.setValue(DOCUMENT_KEY, params[DOCUMENT_KEY]);
        gr.setValue(METHOD, currentMethod);
        gr.setValue(CATALOG_ITEM, params[CATALOG_ITEM]);

        var choices;

        if (params[ENGAGEMENT_CHANNEL]) {
            choices = GlideScriptChoiceList.getChoiceList(CHANNEL_ANALYTICS, ENGAGEMENT_CHANNEL);
            var engagementChannel = (choices && choices.getChoice(params[ENGAGEMENT_CHANNEL])) ? params[ENGAGEMENT_CHANNEL] : DEFAULT;
            gr.setValue(ENGAGEMENT_CHANNEL, engagementChannel);
        }

        if (params[REFERRER]) {
            choices = GlideScriptChoiceList.getChoiceList(CHANNEL_ANALYTICS, REFERRER);
            var referrer = (choices && choices.getChoice(params[REFERRER])) ? params[REFERRER] : DEFAULT;
            gr.setValue(REFERRER, referrer);
        }

        if (params[ORDER_GUIDE])
            gr.setValue(ORDER_GUIDE, params[ORDER_GUIDE]);

        if (params[TASK_ID])
            gr.setValue(TASK_ID, params[TASK_ID]);

        if (params[FULFILLMENT_AUTOMATION_LEVEL]) {
            var automationLevelChoices = GlideScriptChoiceList.getChoiceList(CHANNEL_ANALYTICS, FULFILLMENT_AUTOMATION_LEVEL);
            var automationLevel = (automationLevelChoices && automationLevelChoices.getChoice(params[FULFILLMENT_AUTOMATION_LEVEL])) ? params[FULFILLMENT_AUTOMATION_LEVEL] : UNSPECIFIED;
            gr.setValue(FULFILLMENT_AUTOMATION_LEVEL, automationLevel);
        }

        if (params[REQUESTED_FOR])
            gr.setValue(REQUESTED_FOR, params[REQUESTED_FOR]);

		if (params[CONVERSATION] && gr.isValidField(CONVERSATION))
			gr.setValue(CONVERSATION, params[CONVERSATION]);

        gr.insert();
    }
})();
