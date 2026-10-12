function transform(input) {
    var wrapperFn = function() {
        var tabFilterMetadata = input.tabFilterMetadata;

        for (var j = 0; j < tabFilterMetadata.length; j++) {
            tabFilterMetadata[j].count = CMDBWsDMUtil.getRowCount("cmdb_data_management_task", tabFilterMetadata[j].fields.filter);
        }
        return tabFilterMetadata;
    };

    return new CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get task count for given filters", wrapperFn);
}
