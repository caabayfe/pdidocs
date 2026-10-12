(function executeRule(current, previous /*null when async*/) {
	
	function parseAndError(jsonToParse, errorMsg) {
		if (jsonToParse) {
			try {
				var curProps = JSON.parse(jsonToParse);
			} catch (e) {
				gs.error(errorMsg, e);
				gs.addErrorMessage(errorMsg);
				current.setAbortAction(true);
			}
		}
	}
	parseAndError(current.props, "Invalid JSON for databroker properties");
	parseAndError(current.output_schema, "Invalid JSON for databroker output schema");

})(current, previous);
