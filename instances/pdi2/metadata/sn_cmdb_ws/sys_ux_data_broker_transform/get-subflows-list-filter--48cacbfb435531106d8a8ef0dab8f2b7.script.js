function transform() {
    var wrapperFunction = function() {
        var dataFilter = "";
        var categoryGr = new GlideRecord("cmdb_policy_type_categories");
        categoryGr.query();

        var subflowCategories = [];
        while (categoryGr.next()) {
            var subflowCategory = categoryGr.getValue("sys_hub_category");
            subflowCategories.push(subflowCategory);
        }

        var encodedQuery = "category.sys_idIN" + subflowCategories.join(",");

        var subflowGr = new GlideRecord("sys_hub_flow");
        subflowGr.addEncodedQuery(encodedQuery, false);
        subflowGr.query();

        var sysIds = [];
        while (subflowGr.next()) {
            var subFlowId = subflowGr.getUniqueValue();
            sysIds.push(subFlowId);
        }

        dataFilter = "sys_idIN" + sysIds.join(",");

        return dataFilter;

    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Subflows List", wrapperFunction);

}
