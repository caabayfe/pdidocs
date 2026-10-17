if (current.sysapproval) {
	var task = new GlideRecord("task");
	task.get(current.sysapproval);
	if (task.sys_class_name) {
		task = new GlideRecord(task.sys_class_name);
		task.get(current.sysapproval);
	
		var title = task.number;
		var extras = [];
	
		if (task.getTableName() == 'sc_request') {
			title += " for: " + task.getDisplayValue('requested_for');

			var items = new GlideRecord('sc_req_item');
			items.query('request', task.sys_id);
			while (items.next()) {
				extras.push("● " + items.cat_item.short_description);
			}
 	    } else if (task.getTableName() == 'change_request'){
			title += " - ";
			title += task.short_description;
    	      
			var extra = "➤ Type: " + task.getDisplayValue('type');
			extra += ", Risk: " + task.getDisplayValue('risk');
			 extra += ", Impact: " + task.getDisplayValue('impact');
			 extras.push(extra);
		 
			 extras.push("➤ Planned start: " + task.getDisplayValue('start_date'));     
		 } else {
			 title += " - ";
			 title += task.short_description;
		 }
	
		titleValues.setTitle(title);
		titleValues.setExtras(extras);
	} else {
		titleValues.setTitle("No associated record");
	}
}
