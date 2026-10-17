function transform(input) {
    var payload = input.payload;

    var policyTypesList = payload.policyTypesList;
    var recordSelection = payload.recordSelection;
    var dataFilter = payload.dataFilter;
    var encodedQuery = "";
    if (global.JSUtil.notNil(dataFilter.encoded_query)) {
        encodedQuery = dataFilter.encoded_query + "^";
    }

    var query = "";
    if (global.JSUtil.notNil(recordSelection.query)) {
        query = recordSelection.query;
    }

    var queryFilter = {
        "table": recordSelection.table,
        "encoded_query": recordSelection.allRecordsSelected ? encodedQuery + query : query
    };
    var isExclusionQueued = false;
    var totalCount = 0;
    var proxy = new sn_cmdb_ws.CMDBWsDMPolicyTypeManager();
    for (var i = 0; i < policyTypesList.length; i++) {
        var policyTypeId = policyTypesList[i].itemId;
        var recordsSelected = recordSelection.selectionCount;
        var wrapperFunction = function() {
            return proxy.addRecordToExclusionListUsingQueryFilter(policyTypeId, queryFilter, recordsSelected);
        };
        var intermediateCount = new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Add to exclusion save list for policy type " + policyTypesList[i].label, wrapperFunction);
        if (intermediateCount < 0)
            isExclusionQueued = true;
        else
            totalCount += intermediateCount;
    }
    return {
        "insertedRecordCount": isExclusionQueued ? -1 : totalCount
    };

}
