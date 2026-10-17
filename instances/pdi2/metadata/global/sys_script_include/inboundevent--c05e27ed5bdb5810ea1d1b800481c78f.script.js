var InBoundEvent = Class.create();
InBoundEvent.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /*
  sn_em_connector_listener_table_for_InboundEvent' is false
	  1. It will check for listener transform scripts in em_connector_push table.
	  2. If "Event Management Connectors" scoped application is installed it will look into sn_em_connector_listener table also if listener transform script is not present in em_connector_push table.
  
  
  sn_em_connector_listener_table_for_InboundEvent' is true
	  1. will look only in sn_em_connector_listener table
	  2. Event Management Connectors scoped app has to be installed
	  
  rerunLoop is true, then we need to look for transform script at em_connector_push table and if we didn't find in old table then look in  sn_em_connector_listener table also if the table exists.
 */
    process: function( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
		var headers = request.headers;
        var body;
 
		//aws cloudwatch events received will be in plain text. So, handling the same.
		var contentType = headers["content-type"] ? headers["content-type"] : '';
		if (contentType.contains('text/plain')) {
			var stream = request.body.dataStream;
			var reader = new GlideTextReader(stream);
			var input = "";
			var ln= "";
			while((ln = reader.readLine()) != null) {
				input += ln;
			}
			body = input;
		} else {
			body = request.body.dataString;
		}
		
        var queryParams = request.queryParams;
        var source = queryParams['source'] ? queryParams['source'][0] : '';
       
        var rerunLoop = false; // if true, will check for the scripts in both em_connector_pusn table and sn_em_connector_listener table
        var listenerTableName;
        var debugListenerTableName;
        var newListenerTable = new TableUtils("sn_em_connector_listener");

        var useNewPushConnectorTable = gs.getProperty('sn_em_connector_listener_table_for_InboundEvent');

        var newListenerTableExists = newListenerTable.tableExists();

        if (useNewPushConnectorTable == 'true' && newListenerTableExists) {
            listenerTableName = 'sn_em_connector_listener';
            debugListenerTableName = 'sn_em_connector_listener_debug';
            rerunLoop = false;
        } else if (useNewPushConnectorTable == 'true' && (! newListenerTableExists)) {
            exception = new sn_ws_err.ServiceError().setStatus(400);
            exception.setMessage('System property sn_em_connector_listener_table_for_InboundEvent is set to true, but sn_em_connector_listener table doesn\'t exist. Check whether \'Event Management Connectors\' application is installed or not.');
            throw exception;
        } else {
            listenerTableName = 'em_connector_push';
            debugListenerTableName = 'em_connector_push_debug';
            if (newListenerTableExists) {
                rerunLoop = true;
            }
        }

        var gr;

        do {
            if (gs.getProperty('cloud.event.debug') == 'true') {
                gr = new GlideRecord(debugListenerTableName);
                gr.body = body;
                gr.source = source;
                var hstr = JSON.stringify(headers);
                gr.headers = hstr;
                gr.query_params = JSON.stringify(queryParams);
                gr.url = request.uri;
                gr.insert();
            }
            var processors = [];

            gr = new GlideRecord(listenerTableName);
            gr.addActiveQuery();
            gr.addQuery('type', '1');
            gr.orderBy('order');
            gr.query();
            var results = {};
            var exception;

            while (gr.next()) {
                var procSource = gr.getValue('source');
                var procName = gr.getValue('name');
                var headerName = gr.getValue('header_name') || '';
                var headerValue = gr.getValue('header_value') || '';
                gs.debug('Checking out processor ' + procName + '|' + procSource + '|' + headerName + '|' + headerValue);
                // Check that URL query param named source matches the source field defined on the event processor OR
                // that the request has a header with name that matches header_name field on the processor and the value of this
                // header starts with the value of the field header_value on the processor

                if (procSource == source || (headers[headerName] && headers[headerName].indexOf(headerValue) == 0)) {
                    var script = gr.getValue('script');
                    gs.debug('Executing event processing script: ' + procName);
                    var evaluator = new GlideScopedEvaluator();
                    evaluator.putVariable('request', request);
                    evaluator.putVariable('response', response);
                    evaluator.putVariable('body', body);
                    evaluator.putVariable('status', 200);
                    var res = evaluator.evaluateScript(gr, 'script');
                    if (evaluator.getVariable('status') !== 200) {
                        exception = new sn_ws_err.ServiceError().setStatus(evaluator.getVariable('status'));
                        exception.setMessage(procName + " : " + res);
                        throw exception;
                    }
                    results[procName] = res;
                    return results;
                }
            }


            //If the new table is already scanned for listener script, should exit and say that listener script is not found.
            if (listenerTableName == 'sn_em_connector_listener') {
                rerunLoop = false;
            } else {
                listenerTableName = 'sn_em_connector_listener';
                debugListenerTableName = 'sn_em_connector_listener_debug';
            }

        } while (rerunLoop);

        exception = new sn_ws_err.ServiceError().setStatus(400);
        exception.setMessage('No Transform script found for given header or source ');
        throw exception;
    },



    type: 'InBoundEvent'
});
