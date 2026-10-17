function getSignalEventSysId(searchEvent) {
    var g = new GlideRecord('sys_search_signal_event');
    g.addQuery('search_event', searchEvent);
    g.query();
    g.next();

    return g.getUniqueValue();
}

function populateSearchSignalEvent() {
    var searchEventGr = new GlideRecord('sys_search_event');
    searchEventGr.query();

    while (searchEventGr.next()) {
        var searchEventSysId = searchEventGr.getUniqueValue();
        var browser = searchEventGr.getValue("browser");
        var latitude = searchEventGr.getValue("latitude");
        var longitude = searchEventGr.getValue("longitude");
        var searchResults = searchEventGr.getValue("search_results");

        var searchSignalEventGr = new GlideRecord('sys_search_signal_event');
        if (!searchSignalEventGr.get('search_event', searchEventSysId)) {
            searchSignalEventGr.initialize();
            searchSignalEventGr.setValue("search_event", searchEventSysId);
            searchSignalEventGr.setValue("browser", browser);
            searchSignalEventGr.setValue("latitude", latitude);
            searchSignalEventGr.setValue("longitude", longitude);
            searchSignalEventGr.setValue("searchResults", searchResults);

            searchSignalEventGr.insert();
        }
    }
}

function populateSearchSignalResultEvent() {
    var resultClickedGr = new GlideRecord('sys_search_result_clicked');
    resultClickedGr.query();

    while (resultClickedGr.next()) {
        var searchEvent = resultClickedGr.getValue("search_event");
        var resultDocId = resultClickedGr.getValue("result_doc_id");
        var description = resultClickedGr.getValue("label_description");
        var sourceTable = resultClickedGr.getValue("source_table");
        var clickIndex = resultClickedGr.getValue("click_index");

        var searchSignalEventSysId = getSignalEventSysId(searchEvent);

        var resultEventGr = new GlideRecord('sys_search_signal_result_event');
        if (!(resultEventGr.get('search_signal_event', searchSignalEventSysId) &&
                resultEventGr.get('label_description', description))) {
			
            resultEventGr.initialize();
            resultEventGr.setValue("result_doc_id", resultDocId);
            resultEventGr.setValue("label_description", description);
            resultEventGr.setValue("source_table", sourceTable);
            resultEventGr.setValue("search_signal_event", searchSignalEventSysId);
            resultEventGr.setValue("ais_doc_id", null);

            var searchSignalResultEventSysId = resultEventGr.insert();
            if (searchSignalResultEventSysId != null) {
                populateSearchSignalResultEventAction(searchSignalResultEventSysId, clickIndex);
            }
        }
    }
}

function populateSearchSignalResultEventAction(searchSignalResultEventSysId, clickIndex) {
    var resultEventActionGr = new GlideRecord('sys_search_signal_result_event_action');
    if (!resultEventActionGr.get('search_signal_result_event', searchSignalResultEventSysId)) {
        resultEventActionGr.initialize();
        resultEventActionGr.setValue("search_signal_result_event", searchSignalResultEventSysId);
        resultEventActionGr.setValue("signal_type", "CLICK");
        resultEventActionGr.setValue("signal_value", clickIndex);
        resultEventActionGr.insert();
    }
}

populateSearchSignalEvent();
populateSearchSignalResultEvent();
