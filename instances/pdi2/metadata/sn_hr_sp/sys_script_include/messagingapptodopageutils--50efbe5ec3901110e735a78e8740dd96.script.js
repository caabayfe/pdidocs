function MessagingAppTodoPageUtils() {}
MessagingAppTodoPageUtils.prototype = {
    initialize: function() {},

    getTodoTaskUrl: function(tableName, sysId) {
        return '?id=hrm_todo&view=sp&sysparm_tableName=' + tableName + '&sys_id=' + sysId;
    },

    getTaskType: function(tableName, sysId) {
        var taskGr = new GlideRecord(tableName);
        taskGr.get(sysId);
        return taskGr.getValue('hr_task_type');
    },

    redirectionNeeded: function(tableName, sysId) {
        if (this.getTaskType(tableName, sysId) == 'e_sign') {
            return true;
        }
        return false;
    },

    type: 'MessagingAppTodoPageUtils'
};
