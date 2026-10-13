(function executeRule(current, previous /*null when async*/) {

	// If the user creates / updates the Metrics collection schedule field for a Azure Connector instance, ensure that this number is at least 60 seconds.
	// This is to prevent Azure throwing silent errors of the type "End time: XXX must be at least 1 minute later than start time: XXX"
	if (current.connector_definition.name == "AzureConnector" &&
 current.kpi_schedule != "" && current.kpi_schedule < 60) {
		current.kpi_schedule = 60;
	}

})(current, previous);
