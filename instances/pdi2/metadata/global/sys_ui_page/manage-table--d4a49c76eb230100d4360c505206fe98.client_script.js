function updateTableNameForRedirect() {
	var dropdown = document.getElementById("table_name_choice");
	var tableName = dropdown.options[dropdown.selectedIndex].value;
	var tableNameHiddenInputField = document.getElementById("table_name");
	tableNameHiddenInputField.value = tableName;
}

function checkSubmit() {
	var dropdown = document.getElementById("table_name_choice");
	var tableName = dropdown.options[dropdown.selectedIndex].value;
	if (tableName == 'none') {
		alert('Please select a table name');
		return false;
	}
	
	return true;
}
