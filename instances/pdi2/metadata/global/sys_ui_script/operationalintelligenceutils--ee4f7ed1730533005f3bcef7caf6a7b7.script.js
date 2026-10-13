var OperationalIntelligenceUtils = {
	/**
	 * Client-sided, opens a new tab to the root url appending params
	 * @param {string} ciSysId - sys_id of the CI
	 * @param {string} rootUrl - root url to the app (eg. "/$insights_explorer.do")
	 * @param {Object} params - key-value pairs of additional parameters (eg. "{metric_view: true}")
	 */
	openMetricView: function(ciSysId, rootUrl, params) {
		if (!ciSysId) {
			g_GlideUI.addOutputMessage({
				msg: getMessage('There is no CI for this record'),
				type: 'info'
			});
			return;
		}
		
		jQuery.ajax({
			url: '/api/now/sa/metric/hasMetrics',
			type: 'POST',
			data: ciSysId,
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
		}).done(function(data) {
			// If there are no metrics, don't continue
			if (!data.result[ciSysId]) {
				g_GlideUI.addOutputMessage({
					msg: formatMessage(getMessage('No metrics for CI {0}'), ciSysId),
					type: 'info'
				});
				return;
			}
			
			var ga = new GlideAjax("MetricExplorerAjax");
			ga.addParam("sysparm_name", "getUrlParameters");
			ga.addParam("sysparm_ciSysId", ciSysId);
			ga.getXMLAnswer(constructUrl);

			function constructUrl(response) {
				var params = JSON.parse(response);

				if (!params["ciType"]) {
					g_GlideUI.addOutputMessage({
						msg: formatMessage(getMessage('Metric Explorer failed to open because the associated CI class is undefined.')),
						type: 'error'
					});
					return;
				}
				
				var url = "/ci-type/" + params["ciType"] + "/start-time/" + params["startTime"] + "/end-time/" + params["endTime"] + "/ci-sys-id/" + ciSysId;
				var fullUrl = rootUrl + url;
				window.open(fullUrl, '_self');
			}
		}).fail(function() {
			// Give an error message if the request failed
			g_GlideUI.addOutputMessage({
				msg: formatMessage(getMessage('Could not check CI {0} for metrics'), ciSysId),
				type: 'error'
			});
		});
	},
	/**
	 * Returns a promise, given a ci class type, query for the associated resource class type
	 * @param {string} ciType - class of the CI (eg. "cmdb_ci_hardware")
	 */
	getMappedResource: function(ciType) {
		return jQuery.ajax({
			url: '/api/now/sa/metric/mappedResource',
			type: 'GET',
			data: {
				ciType: ciType
			},
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
		}).done(function(data) {
			return data.result;
		}).fail(function() {
			g_GlideUI.addOutputMessage({
				msg: formatMessage(getMessage('Failed to query associated resource for CI type {0}'), ciType),
				type: 'error'
			});
		});
	},
};
