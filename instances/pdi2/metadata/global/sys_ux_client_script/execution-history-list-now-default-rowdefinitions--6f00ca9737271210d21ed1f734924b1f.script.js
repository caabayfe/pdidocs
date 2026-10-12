/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(!api.data.transform_execution_history_of_a_rule.output) return {rows: []};
    var executionRows = api.data.transform_execution_history_of_a_rule.output.rows;
    if (executionRows.length == 0) {
        return {};
    }

    const hr =  helpers.translateSync("Hour");
    const hrs =  helpers.translateSync("Hours");
    const min =  helpers.translateSync("Minute");
    const mins =  helpers.translateSync("Minutes");
    const second =  helpers.translateSync("Second");
    const seconds =  helpers.translateSync("Seconds");

    function formatDuration(milliseconds) {
		var totalSeconds = Math.floor(milliseconds / 1000);
		var hours = Math.floor(totalSeconds / 3600);
		var minutes = Math.floor((totalSeconds % 3600) / 60);
		var seconds = totalSeconds % 60;

		var parts = [];
		if (hours > 0) parts.push(`${hours} ${hours > 1 ? hrs : hr}`);
		if (minutes > 0) parts.push(`${minutes} ${minutes > 1 ? mins : min}`);
		if (seconds > 0) parts.push(`${seconds} ${seconds > 1 ? seconds : second}`);

		return parts.length ? parts.join(' ') : `0 ${second}`;
	}

    var rows = executionRows.map((execution, index) => {
        return {
            cells: {
                executionTime: {
                    value: execution.executionTime
                },
                recordsImpacted: {
                    value: execution.recordsImpacted,
                },
                duration: {
                    value: formatDuration(execution.duration),
                }
            },
            key: "rowKey" + index,
        };
    });

    const rowDefinition = {
        rows: rows
    };
    return rowDefinition;
}
