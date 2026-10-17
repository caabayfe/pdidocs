(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
						/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
						/* Optional GlideRecord */ event) {
    // parm2 - Open tasks sysIds
    var url = "";
    var taskId = event.parm2;
    if (!JSUtil.nil(taskId)) {
        var reviewGr = new GlideRecord('cmdb_data_management_task');
        reviewGr.addQuery('sys_id', taskId);
        reviewGr.query();
		if(reviewGr.next()) {
		template.print('<b>'+'Reminder: Task '+ reviewGr.getValue('number')+' assigned to you on '+reviewGr.getValue('sys_created_on')+' requires your attention.'+'</b><br><br>');
            url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/task-detail/' + reviewGr.getValue('sys_id') + '">' + reviewGr.policy_id.name + " - " + reviewGr.getValue("number") + '</a>';
            template.print(url + "<br>");
            reviewGr.setValue('last_notification_time', gs.nowDateTime());
            reviewGr.update();
        }
    }
})(current, template, email, email_action, event);
