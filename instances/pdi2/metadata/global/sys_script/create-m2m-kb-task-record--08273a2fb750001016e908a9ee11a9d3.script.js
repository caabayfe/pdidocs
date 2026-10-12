(function executeRule(current, previous /*null when async*/ ) {
    if (current.sys_id) {
        var taskList = [];
        var key = "KMAttachedKnowledge_" + current.sys_id;
        var sourceTaskId = gs.getSession().getClientData(key);
        var instrumentationMetadata = JSON.parse(current.instrumentation_metadata || '{}');
        if (instrumentationMetadata && instrumentationMetadata.taskList && instrumentationMetadata.taskList.length > 0) {
            taskList = instrumentationMetadata.taskList;

        }
        if (taskList.length == 0 && current.source) {
            taskList.push(current.getValue('source'));

        }

        if (taskList.length > 0) {
            for (var index = 0; index < taskList.length; index++) {
                if (!gs.nil(sourceTaskId) && taskList[index] == sourceTaskId) {
                    gs.getSession().putClientData(key, null);
                    continue;
                }
                var gr = new GlideRecord("m2m_kb_task");
                gr.initialize();
                gr.setValue('kb_knowledge', current.sys_id);
                gr.setValue('task', taskList[index]);
                var attachid = gr.insert();
                if (attachid) {
                    var message = gs.getMessage("This Knowledge Article:{0} has been saved as a draft and attached to the task record: {1}", [current.number, gr.getDisplayValue('task')]);
                    gs.addInfoMessage(message);
                }
            }
        }
    }

})(current, previous);
