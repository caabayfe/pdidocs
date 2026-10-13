function actionOK() {
	var aggregator = gel('aggregator_choice').value;
	var filterHr = gel('filter_hr_choice').value;

	var data = Object.toJSON({
		'aggregator': aggregator,
		'filter_hr': filterHr
	});

	// Decode URL items to check for path traversal and encoded path traversal
	var table = decodeURIComponent('$[sysparm_list]');
	var metric = decodeURIComponent('$[sysparm_list_element]');

	// Only allow alphanumeric and underscore characters
	// The table and metric names are already restricted to these characters,
	// so we don't have to worry about others
	var re = /^[a-zA-Z0-9_]+$/;
	var tableMatches = re.exec(table);
	var metricMatches = re.exec(metric);
	
	var tableValid = (tableMatches != null && tableMatches.length > 0 && tableMatches[0].length == table.length);
	var metricValid = (metricMatches != null && metricMatches.length > 0 && metricMatches[0].length == metric.length);
	
	if ((!tableValid) || (!metricValid)) {
		alert("Attempted path traversal, verify your URL is correct");
	}
	else {
		var url = '/api/now/v1/metric/ui/preference/$[sysparm_list]/$[sysparm_list_element]';
		new Ajax.Request(url, {
			asynchronous: false,
			requestHeaders: {
				"X-UserToken": window.g_ck
			},
			contentType: 'application/json;charset=UTF-8',
			parameters: data,
			onFailure: function() {
				console.log('Unable to set metric preference');
				retStatus = false;
			}
		});

		var search = self.location.href;
		if (search.indexOf("sysparm_refresh") == -1) {
			if (search.indexOf("?") == -1)
				search += "?";
			else
				search += "&";

			search += "sysparm_refresh=refresh";
		}
		
		self.location.href = search;
	}
}
