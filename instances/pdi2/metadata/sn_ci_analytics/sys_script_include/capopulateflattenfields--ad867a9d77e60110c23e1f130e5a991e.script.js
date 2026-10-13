var CAPopulateFlattenFields = Class.create();
CAPopulateFlattenFields.prototype = {
    initialize: function() {
        this.config = new CAConfig();
        this.logger = CIAnalyticsLogger.getLogger("CAPopulateFlattenFields");
    },
    populateFlattenFields: function() {
        try {
            //Disabling ETL Process
            this.config.disableAnalyticsProcessing();
            var gr = new GlideRecord('sn_ci_analytics_conversation');
            gr.addQuery('status', 'new').addOrCondition('status', 'onHold');
            gr.addNullQuery('consumer').addOrCondition('conversation_type');
            gr.query();
            while (gr.next()) {
                try {
                    var completedStates = gs.getProperty('sn_ci_analytics.analytic_conversation_completed_states', '');
                    gr.setValue('consumer', gr.conversation.consumer.sys_id);
                    gr.setValue('conversation_type', gr.conversation.conversation_type);
                    gr.setValue('conversation_created_at', gr.conversation.sys_created_on);
                    gr.setValue('conversation_closed_at', gr.conversation.conversation_completed);
                    var state = completedStates.includes(gr.conversation.state) ? 'completed' : 'open';
                    gr.setValue('conversation_state', state);
                    gr.update();
                } catch (e) {
                    this.logger.error('Conversation Falttening failed ' + gr.conversation.sys_id + ' ' + e.message);
                }
            }
            //Enabling ETL Process
            this.config.enableAnalyticsProcessing();
        } catch (e) {
            //Enabling ETL Process
            this.config.enableAnalyticsProcessing();
            this.logger.error('Flattening Conversations Migration Error ' + e.message);
        }

    },
    type: 'CAPopulateFlattenFields'
};
