function onLoad() {
	var type = g_form.getValue("type");
	if(type == "2") {
		var availableDefaultReferenceField = gel("sys_ui_hp_publisher.default_reference_field_value_left");
		var selectedDefaultReferenceField = gel("sys_ui_hp_publisher.default_reference_field_value_right");
		var availableOptions = 	availableDefaultReferenceField.options;
		var selectedOptions = selectedDefaultReferenceField.options;
		var availableOptionsLength = availableOptions.length;
		availableDefaultReferenceField.options.length = 0;
		selectedDefaultReferenceField.options.length = 0;
		var referenceConditions = gel("sys_ui_hp_publisher.reference_conditions");
		var currentTableSelected = g_form.getValue("reference_table");
		var encodedCondition = g_form.getValue("reference_conditions");
		var selected = document.getElementById("sys_original.sys_ui_hp_publisher.default_reference_field_value").value;
		selected = selected.split(",");
		
		var handleTableSelection = function (response) {
			var answer = response;
			var result = response.responseXML.getElementsByTagName("result");
			var recordsString = result[0].getAttribute("record");
			var records = JSON.parse(recordsString);
			for(var i = 0, j = 0;i<records.length;i++){
				var opt = new Option(records[i].value, records[i].key);
				availableOptions[i]= opt;
				var index = selected.indexOf(records[i].key);
				if(index > -1) {
					var opt2 = new Option(records[i].value, records[i].key);
					selectedOptions[j]= opt2;
					j++;
				}
			}	
		};
		
		var ga = new GlideAjax('ReferenceFilterTableSelection');
		ga.addParam("sysparm_name","getRecords");
		ga.addParam('sysparm_reference_table',currentTableSelected);
		ga.addParam('sysparm_reference_conditions',encodedCondition);
		ga.getXML(handleTableSelection);
		
		
	}
}
