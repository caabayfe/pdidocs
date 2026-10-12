function onLoad() {
}

function addTargetChoices(response) {
		var resultJSON = response.responseXML.documentElement.getAttribute('answer');
		var result = JSON.parse(resultJSON);
		if (result == null)
			return;
		
		var parentTable = String(result["parentTable"]);
		var targetListJSON = String(result["targetList"]);
		var targetList;
		
		var currentTarget = g_form.getValue('target');
		g_form.clearOptions('target');
		if (parentTable === "sys_sg_view_config") {
			targetList = JSON.parse(targetListJSON);
			for (var index = 0; index < targetList.length; index++) {
				var label = targetList[index].name + ' - [' + targetList[index].id + ']';
				if(targetList[index].cellId) 
					label = targetList[index].cellId + " - " + targetList[index].name +  ' - [' + targetList[index].id + ']';
				
				g_form.addOption('target', targetList[index].id, label);
			}
		} else if (parentTable === "sys_sg_parameter_screen" || parentTable === "sys_sg_parameter_section") {
			targetList = targetListJSON.split(",");
			for (var index2 = 0; index2 < targetList.length; index2++){
				var value = targetList[index2];
				var variablePrefix = "variable: ";
				var inputPrefix = "input: ";
				var processedValue = value;
				if (value.startsWith(variablePrefix))
					processedValue = '{{'+value.substring(variablePrefix.length)+'}}';
				else if (value.startsWith(inputPrefix))
					processedValue = value.substring(inputPrefix.length);
				g_form.addOption('target', processedValue, value);
			}
		}
	}
