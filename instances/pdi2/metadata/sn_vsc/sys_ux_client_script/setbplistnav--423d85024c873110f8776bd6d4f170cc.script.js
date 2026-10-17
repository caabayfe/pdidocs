function handler({
    api,
    event,
    helpers,
    imports
}) {
    var route = "";
    var params = {};
    var advancedFilterQuery = api?.state?.advancedFilterQuery;
    if (typeof advancedFilterQuery != 'string') {
        advancedFilterQuery = api?.context?.props?.query || "";
    }
    var table = event.payload.table;
    var sysId = event.payload.sys_id;
    if (table === "sn_vsc_best_practice_configurations") {
        route = "best-practices-details";
        params = {
            query: advancedFilterQuery
        };
    } else {
        route = "record";
    }
    var fields = {
        table: table,
        sysId: sysId,
    };

    helpers.navigate.to(route, fields, params, null, null, null, null);
}
