
    function handler({api, event, helpers, imports}) {
        var route = "";
        var params = {page: "security_policies"};
        var table = event?.payload?.table;
        var sysId = event?.payload?.sys_id;
        if (!table || !sysId) {
            console.error("Unexpected payload: table: " + table + ", sys_id: " + sysId);
            return;        
        }
        if (table === "sn_vsc_security_policy") {
            route = "security_policy_details";
        } else {
            route = "record";
        }
        var fields = {
            table: table,
            sysId: sysId,
        };

        helpers.navigate.to(route, fields, params, null, null, null, null);
    }
