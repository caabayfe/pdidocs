function handler({api, event, helpers, imports}) {
    var route = "";
    var params = {page: "critical_updates_home"};
    var table = event.payload.table;
    var sysId = event.payload.sys_id;
    if (table === "sn_critical_update") {
        route = "critical-update-details";
    } else {
        route = "record";
    }

    var fields = {
        table: table,
        sysId: sysId,
    };

    helpers.navigate.to(route, fields, params, null, null, null, null);
}
