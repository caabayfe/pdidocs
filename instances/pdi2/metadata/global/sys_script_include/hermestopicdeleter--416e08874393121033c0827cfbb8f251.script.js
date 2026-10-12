var HermesTopicDeleter = Class.create();
HermesTopicDeleter.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    deleteRecords: function() {
        var ids = this.getParameter('sysparm_ids');
        if (!ids)
            return;

        var gr = new GlideRecordSecure('sys_kafka_topic');
        gr.addQuery('sys_id', 'IN', ids);
        gr.query();
        while (gr.next()) {
            gr.deleteRecord();
        }
    },

    type: 'HermesTopicDeleter'
});
