(function executeRule(current, previous /*null when async*/ ) {
    // update connectors
    var eccQueue = new GlideRecord('ecc_queue');
    eccQueue.addQuery('agent', 'mid.server.' + current.name);
    //when mid server goes down, change both ready and processing entries to processed, so that next run of connectors may execute with different mid.
    eccQueue.addQuery('state',"IN", 'ready,processing');
    eccQueue.addQuery('queue', 'output');
    eccQueue.addQuery('topic', 'ConnectorProbe');
    eccQueue.query();
    while (eccQueue.next()) {
        //ecc_queue entry can be for event collection or for metric collection. So depending on that change running ot kpi_running flag to not_running
        var eventCollectionEntry = false;
        var metricCollectionEntry = false;
		var conn = "";

        var json = SncProbe.getJsonPayload(eccQueue);
        var param = json["parameter"];

        for (var index in param) {
            if (param[index]["@name"] === "retrieve_kpi") {
                metricCollectionEntry = true;
                break;
            } else if ( (param[index]["@name"] === "last_event" ) || ( param[index]["@name"] === "script_type") ) {
		//for event collection run, the output ecc_queue entry will have last_event/script_type. for first connector instance run last_event param may not be there.
                eventCollectionEntry = true;
                break;
            }
        }

		//If its events run change running state to false
        if (eventCollectionEntry) {
            conn = new GlideRecord('em_connector_instance');
            conn.addQuery('name', eccQueue.getValue('source'));
            conn.addQuery('running', '1');
            conn.query();
            if (conn.next()) {
                conn.setValue('running', '0');
                conn.update();
            }
        } else if (metricCollectionEntry) { //If its metrics run change running state to false
            conn = new GlideRecord('em_connector_instance');
            conn.addQuery('name', eccQueue.getValue('source'));
            conn.addQuery('kpi_running', '1');
            conn.query();
            if (conn.next()) {
                conn.setValue('kpi_running', '0');
                conn.update();
            }

        }
	gs.info("*** "+eccQueue.getValue('source') +" ConnectorProbe entry is moved to processed as the midserver went down. ***");
        eccQueue.state = 'processed';
        eccQueue.processed = gs.nowDateTime();
        eccQueue.update();
    }

})(current, previous);
