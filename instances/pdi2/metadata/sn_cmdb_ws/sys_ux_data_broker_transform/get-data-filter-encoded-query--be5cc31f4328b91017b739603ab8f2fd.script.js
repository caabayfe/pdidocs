function transform(input) {
    var wrapperFunction = function() {
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        var util = new sn_cmdb_ws.CMDBWorkspaceUtil();

        var completedDataFilter = proxy.buildDataFilterForPreview(
            input.policyTypeId,
            input.table,
            input.encodedQuery
        );

        completedDataFilter.recordCount = "";
        completedDataFilter.excludedCount = "";
        var gr = new GlideRecord(completedDataFilter.table);
        completedDataFilter.tableLabel = gr.getClassDisplayValue();
        completedDataFilter.isCMDBTable = util.isCMDBTable(completedDataFilter.table);
        return completedDataFilter;
    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get data filter encoded query", wrapperFunction);
}
