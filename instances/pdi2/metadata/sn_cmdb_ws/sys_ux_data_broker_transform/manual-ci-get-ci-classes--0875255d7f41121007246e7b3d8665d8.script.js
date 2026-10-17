function transform(input) {
    const {
        applicationId,
        classHierarchyFilter
    } = input;
    const service = new sn_cmdb_ws.CMDBWsManualCreateCIService();
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_mcc", "Get CI Classes", function() {
        return {
            included: service.getCiClasses(applicationId, classHierarchyFilter),
            excluded: service.getExcludedClasses(applicationId)
        };
    });
    }
