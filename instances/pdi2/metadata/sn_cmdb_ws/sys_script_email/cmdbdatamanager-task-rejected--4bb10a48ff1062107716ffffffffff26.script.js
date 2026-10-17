(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

    /**
     *   event - sn_cmdb_ws.cmdbdatamanager.task.rejected
     *   current - cmdb_data_management_task record
     *   parm1 - list of users comma separated (email recipients)
     *   parm2 - taskRejectionComments
     **/

    var taskId = current.sys_id;
    var taskRejectionComments = event.parm2;

    if (taskId) {
        var reviewGr = new GlideRecord('cmdb_data_management_task');
        if (reviewGr.get(taskId)) {
            var url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/task-detail/' + taskId + '">' + reviewGr.getValue('number') + '</a>';
            template.print(gs.getMessage('CMDB Data Manager task {0} was {1}<br><br>', [url, taskRejectionComments]));
            reviewGr.setValue('last_notification_time', new GlideDateTime());
            reviewGr.update();
        } else {
            gs.warn("'CMDB Data Manager Task Rejected' email notification script received an unknown taskId.");
        }
    } else {
        gs.warn("'CMDB Data Manager Task Rejected' email notification script did not receive any associated task.");
    }

})(current, template, email, email_action, event);
