updateSchedule();
function updateSchedule(){
	var definitionId = current.connector_definition;
	var definition = new GlideRecord('em_connector_definition');
	definition.get(definitionId);
	if (current.schedule.nil() || current.schedule == 0)
		current.schedule = definition.schedule;
	if (current.kpi_schedule.nil() || current.kpi_schedule == 0)
		current.kpi_schedule = definition.kpi_schedule;
}
