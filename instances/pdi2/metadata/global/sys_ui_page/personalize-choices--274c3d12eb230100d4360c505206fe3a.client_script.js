function refreshFieldList() {
	// Table name value
	var dropdown = document.getElementById("table_name_choice");
	var tableName = dropdown.options[dropdown.selectedIndex].value;
	
	var url = new GlideURL('personalize_choices.do');
	url.addParam('sysparm_table', tableName);
	window.location = url.getURL();
}

function updateTableAndFieldNameForRedirect() {
	// Table name value
	var dropdown = document.getElementById("table_name_choice");
	var tableName = dropdown.options[dropdown.selectedIndex].value;
	var tableNameHiddenInputField = document.getElementById("table_name");
	tableNameHiddenInputField.value = tableName;
	
	// Field name value
	dropdown = document.getElementById("field_name_choice");
	var fieldName = dropdown.options[dropdown.selectedIndex].value;
	var fieldNameHiddenInputField = document.getElementById("field_name");
	fieldNameHiddenInputField.value = fieldName;
}

function checkSubmit() {
	var dropdown = document.getElementById("table_name_choice");
	var tableName = dropdown.options[dropdown.selectedIndex].value;
	if (tableName == "none") {
		alert("Please select a table");
		return false;
	}
	
	dropdown = document.getElementById("field_name_choice");
	var fieldName = dropdown.options[dropdown.selectedIndex].value;
	if (fieldName == "none") {
		alert("Please select a field");
		return false;
	}
	
	return true;
}
