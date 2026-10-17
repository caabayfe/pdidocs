(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
		/**
		*  parm2 - needsReviewTasks is all sys_id of tasks that are open. automaticTasks are needs_review=false and are set to work in progress (and then closed) during the workflow
		*
		*/
		var url = "";
		var raw = event.parm2;
		if (!raw) {
			gs.warn("CMDB Data Manager task notification script did not receive any associated tasks.");
			template.print("**Error** There were no tasks created for this run.");
		} else {
			var taskObject = JSON.parse(raw);
			gs.log(taskObject);
			if (taskObject.needsReviewTasks && taskObject.needsReviewTasks.length > 0) {
				var reviewGr = new GlideRecord('cmdb_data_management_task');
				reviewGr.addQuery("sys_id", "IN", taskObject.needsReviewTasks);
				reviewGr.orderBy("policy_id");
				reviewGr.query();
				template.print("<b>Tasks that need review:</b><br><br>");
				while (reviewGr.next()) {
					url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/task-detail/' + reviewGr.getValue("sys_id") + '">' + reviewGr.policy_id.name + " - " + reviewGr.getValue("number") + '</a>';
					template.print(url + "<br>");
				}
			}
			if (taskObject.automaticTasks && taskObject.automaticTasks.length > 0) {
				var autoGr = new GlideRecord('cmdb_data_management_task');
				autoGr.addQuery("sys_id", "IN", taskObject.automaticTasks);
				autoGr.orderBy("policy_id");
				autoGr.query();
				template.print("<br><b>Tasks processed automatically:</b><br><br>");
				while (autoGr.next()) {
					url = '<a href="' + gs.getProperty('glide.servlet.uri') + 'now/cmdb/task-detail/' + autoGr.getValue("sys_id") + '">' + autoGr.policy_id.name + " - " + autoGr.getValue("number") + '</a>';
					template.print(url + "<br>");
				}
			}
		}


})(current, template, email, email_action, event);
