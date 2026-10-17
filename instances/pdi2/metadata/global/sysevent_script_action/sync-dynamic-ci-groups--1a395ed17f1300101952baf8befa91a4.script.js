var groupId = event.parm1;
var action = event.parm2;
var qbsManager = new SNC.QueryBasedServiceManager();

// Find the empty dynamic CI groups and update the svc_ci_assoc table for these services
if (action == "delete") {
    var gr = new GlideRecord('cmdb_ci_query_based_service');
    gr.addQuery('cmdb_group', '');
    gr.addQuery('table', '');
    gr.query();
    while (gr.next()) {
        var serviceId = gr.getUniqueValue();
        qbsManager.updateSvcAssoc(serviceId);
    }
}

// Find the dynamic CI groups that are associated to this cmdb group and update the svc_ci_assoc table for these services
else if (action == "update") {
    var gr2 = new GlideRecord('cmdb_ci_query_based_service');
    gr2.addQuery('cmdb_group', groupId);
    gr2.query();
    while (gr2.next()) {
        var serviceId2 = gr2.getUniqueValue();
        qbsManager.updateSvcAssoc(serviceId2);
    }
}
