if (!current.task_number || current.task_number.getRefRecord().getTableName() !== 'change_request')
	addShortDescription();

function addShortDescription(){
	if(current.cmdb_ci != "" && current.cmdb_ci.name != "")
		current.short_description = current.cmdb_ci.name + " Outage";
	else 
		current.short_description = "Outage";
}
