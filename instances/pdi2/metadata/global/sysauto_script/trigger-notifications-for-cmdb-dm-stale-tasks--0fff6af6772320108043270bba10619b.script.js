var notifications_frequency = gs.getProperty('cmdb.data.manager.stale.tasks.notifications.frequency', 7);
var notifications_condition = 'last_notification_timeISEMPTY^sys_created_onRELATIVELT@dayofweek@ago@' + notifications_frequency + '^NQlast_notification_timeRELATIVELT@dayofweek@ago@' +notifications_frequency;

var tasks = [];
var taskGr = new GlideRecord('cmdb_data_management_task');
taskGr.addEncodedQuery(notifications_condition);
taskGr.addQuery('state', 1); //Open tasks
taskGr.query();
while (taskGr.next()) {
        tasks.push(taskGr.getValue('sys_id'));
}

if (tasks.length > 0) {
    var tasksMap = {};
    var sysApprovalGr = new GlideRecord('sysapproval_approver');
    sysApprovalGr.addQuery('state', 'requested');
    sysApprovalGr.addQuery('sysapproval', 'IN', tasks);
    sysApprovalGr.query();
    while (sysApprovalGr.next()) {
        if (tasksMap[sysApprovalGr.getValue('sysapproval')] == undefined) {
            tasksMap[sysApprovalGr.getValue('sysapproval')] = [];
        }
        if (tasksMap[sysApprovalGr.getValue('sysapproval')].indexOf(sysApprovalGr.getValue('sysapproval')) < 0) {
            tasksMap[sysApprovalGr.getValue('sysapproval')].push(sysApprovalGr.getValue('approver'));
        }
    }
    Object.keys(tasksMap).forEach(function(sysapproval) {
        gs.eventQueue("cmdbdatamanager.task.stale", taskGr, tasksMap[sysapproval].toString(), sysapproval);
    });

}
