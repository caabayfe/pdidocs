function transform(input) {
	for(var i = 0; i < input.evambroker.items.length; i++){
		var model = input.evambroker.items[i].propValues;
		var currDate = new GlideDateTime();
		var dueDate = new GlideDateTime();
		var requestedFor = model.model["sysapproval.ref_asset_task.requested_for"] || model.model["sysapproval.ref_sc_request.requested_for"] || model.model["sysapproval.ref_sc_req_item.requested_for"] || model.model["sysapproval.requested_by"] || model.model["sysapproval.opened_by"] || model.model.sys_created_by;
		dueDate.setValue(model.model.due_date);
		if(model.model.due_date != ""){
				model.highlightedHeaderLabel = gs.getMessage("{0}", dueDate);	
				if (model.model.due_date.includes('ago') || (dueDate.isValid() && currDate.compareTo(dueDate) > -1)) { 
					model.highlightedHeaderBkgColor = "critical";
					model.highlightedHeaderLabel = gs.getMessage("Overdue");
				}
		} else { 
				model.highlightedHeaderLabel = gs.getMessage("No due date");
		}
		if(model.model.table == "sc_req_item"){
			if(model.model.recurring_frequency != null){
				model.subtitle = model.subtitle + " + " + model.model.recurring_price + " " + model.model.recurring_frequency;
			}
		}
		if(model.model.sys_created_on != null){
			var createdDate = new GlideDateTime();
			createdDate.setValue(model.model.sys_created_on);
			model.detailValueOne = createdDate.toString();
		}
		
		if(requestedFor){ 
			model.subtitle = gs.getMessage("Requested for {0}", requestedFor);
		}
	}

	return input;
}
