var VSCGetScanResultsDateTimeUtil = Class.create();
VSCGetScanResultsDateTimeUtil.prototype = {
    initialize: function() {},

	/*
 	* Function to get scan results created on time from date as input
 	* @params: input date selected from date picker component
 	* @return: list of created_on time in result array 
 	*
 	*/
    getResultsTimeFromDateSelection: function(inputDate, inputSuite) {
        var results = [];
        if (!inputDate) {
            return results;
        }

        var scanStart = "start";
        var scanEnd = "end";
        var date = inputDate;

        var gr_suite = new GlideRecord('scan_suite_execution');
		gr_suite.addQuery('suite.sys_id', inputSuite);
        var query = "sys_created_onON" + date + "@javascript:gs.dateGenerate('" + date + "','" + scanStart + "')@javascript:gs.dateGenerate('" + date + "','" + scanEnd + "')";
        gr_suite.addEncodedQuery(query, true);
        gr_suite.query();
        while (gr_suite.next()) {
            var resultId = gr_suite.sys_id.toString();
            var label = gr_suite.sys_created_on.getDisplayValue().toString();
            var timeLabel = label.split(" ")[1];
            results.push({
                "label": timeLabel,
                "id": resultId
            });
        }

        results.sort(function(a, b) {
            a = a.label.toUpperCase();
            b = b.label.toUpperCase();
            return (a > b) ? -1 : (a < b) ? 1 : 0;
        });

        return results;
    },

    type: 'VSCGetScanResultsDateTimeUtil'
};
