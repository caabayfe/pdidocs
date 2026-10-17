var IPCKnowledgeUtilSNC = Class.create();

IPCKnowledgeUtilSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    TABLES: {
        M2M_KB_TASK: "m2m_kb_task",
    },

    initialize: function(request, responseXML, gc) {
        AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    removeAttachedKnowledgeMapping: function(taskM2MGr) {
        var gr = new GlideRecord(this.TABLES.M2M_KB_TASK);
        if (gr.get(taskM2MGr.sys_id)) {
            var taskGr = new GlideRecord('task');
            if (taskGr.get(taskM2MGr.task) && taskGr.canWrite())
                gr.deleteRecord();
        }

    },

    type: 'IPCKnowledgeUtilSNC'
});
