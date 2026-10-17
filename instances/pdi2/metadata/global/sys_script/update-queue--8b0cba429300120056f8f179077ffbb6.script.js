(function executeRule(current, previous /*null when async*/) {
	try {	
		if (current.operation() == "update" && current.last_update_time_by_event != previous.last_update_time_by_event) {
			//implies that the update is due to incoming event - no need to update the source
			return;
		}
		var alertManager = new SNC.AlertManager();
	    alertManager.addStep("Alert BR: Update queue (after)");
		var toSave = false;
		var connectorManager = new SNC.ConnectorManager();
		
		var isBiDirectional = connectorManager.isConnectorInstanceBiDirectional(current.event_class);
		if (!isBiDirectional)
			return;
		
		var jsonArray = [];
		if( current.operation() == "insert") {
			//only notify the alert number to the source
			var json = {'fieldName':'','oldValue':'','newValue':''};
			json.fieldName = 'number';
			json.newValue = current.getValue('number');
			jsonArray.push(json);
			toSave = true;
		} else {
			//find all the fields that have been changed in order to notify the source
			var fields = current.getFields();
			
			for (var i = 0; i < fields.size(); i++) {
				var fieldName = fields.get(i).getName();
				if (current.getValue(fieldName) != previous.getValue(fieldName)) {
					var currentJson = {'fieldName':'','oldValue':'','newValue':''};
					currentJson.fieldName = fieldName;
					currentJson.oldValue = previous.getElement(fieldName).getDisplayValueLang("en");
					currentJson.newValue = fields.get(i).getDisplayValueLang("en");
					
					// Make sure values not equals to null or NULL
					if(isEmpty(currentJson.oldValue))
						currentJson.oldValue = "";
					if(isEmpty(currentJson.newValue))
						currentJson.newValue = "";
					if(currentJson.oldValue == currentJson.newValue) {
						gs.log("Update queue: same values for field " + fieldName + " current: " + current.getValue(fieldName) + " previous: " + previous.getValue(fieldName) + " new: " + fields.get(i).getDisplayValueLang("en") + " old: " + previous.getElement(fieldName).getDisplayValueLang("en") + " field index: " + i + " continue..");
						continue;
					}
					
					jsonArray.push(currentJson);
					toSave = true;
				}
			}
			
		}
		
		if(toSave) {
			//add record to queue
			var gr = new GlideRecord('em_connector_update_queue');
			gr.setValue('source', current.source);
			gr.setValue('source_instance', current.event_class);
			gr.setValue('alert', current.sys_id);
			gr.setValue('fields_json', JSON.stringify(jsonArray));
			gr.insert();
		}
		
	} catch(e) {
		gs.logError("Business rule 'Update queue' failed for alert record " + current.sys_id + " - " + e);
	}
	
	function isEmpty(field) {
       if(GlideStringUtil.nil(field) || field == "NULL" || field == "null")
			return true;
	   return false;
   }
	
})(current, previous);
