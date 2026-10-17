function transform(input) {
    var wrapperFunction = function() {
        var tableName = input.tableName;
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        var referenceFields = proxy.getReferenceFieldsForTable(tableName);
        var items = {};
        items[tableName] = {};

        var schema = {};
        for (var i = 0; i < referenceFields.length; i++) {
            var obj = {
                label: referenceFields[i].label,
                reference: referenceFields[i].type,
                value: referenceFields[i].name
            };
            schema[referenceFields[i].name] = obj;
            items[tableName] = schema;
        }
        return items;
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Dot-walk Assignment Options", wrapperFunction);
}
