(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var writer = response.getStreamWriter();
    var hdrs = {};
    var table = 'sa_time_series';
	// GlideRecord secure avoids access to cmdb_ci
    var gr = new GlideRecord(table);

    hdrs['Content-Type'] = 'application/json';
    response.setStatus(200);
    response.setHeaders(hdrs);
	var metricTypeId = "";
    gr.addQuery("cmdb_ci", request.queryParams.ciSysId);
    if (!gs.nil(request.queryParams.metricTypeId)) {
      gr.addQuery("metric_type_id", request.queryParams.metricTypeId);
	  metricTypeId = request.queryParams.metricTypeId;	
    }
    if (!gs.nil(request.queryParams.modelType)) {
        gr.addQuery("model_type", request.queryParams.modelType);
    } else {
        // Group together models of same series so they are written together
        gr.orderBy("metric_type_id");
    }
    gr.query();
	var seriesInfo = new SNC.SeriesInfo(request.queryParams.ciSysId, metricTypeId);
    writer.writeString("{\"results\":[");

    while (gr.next()) {
        var timeSeriesObj = {};

        timeSeriesObj.resource_id = gr.resource_id + '';
        timeSeriesObj.metric_type_id = gr.metric_type_id + '';
        timeSeriesObj.classifier = gr.classifier + '';
        timeSeriesObj.trained_time = gr.trained_time + '';
        timeSeriesObj.cmdb_ci = gr.cmdb_ci + '';
        timeSeriesObj.model_type = gr.model_type + '';
        timeSeriesObj.expiration_time = new GlideDateTime(gr.expiration_time).getNumericValue() + '';
		var adEnabled = seriesInfo.isADEnabled(gr.cmdb_ci + '', gr.resource_id + '', gr.metric_type_id + '');
		// If AD is not enabled, return empty content to MID
        if (adEnabled) {
			if (!gs.nil(gr.getValue("short_content"))) {
				timeSeriesObj.content = gr.getValue("short_content") + '';
			} else if (!gs.nil(gr.getValue("content"))) {
				timeSeriesObj.content = gr.getValue("content") + '';
			} else {
				timeSeriesObj.content = '';
			}
		} else {
			timeSeriesObj.content = '';
		}
        
        writer.writeString(global.JSON.stringify(timeSeriesObj));

        if (gr.hasNext()) {
            writer.writeString(",");
        }
    }

    writer.writeString("]}");

})(request, response);
