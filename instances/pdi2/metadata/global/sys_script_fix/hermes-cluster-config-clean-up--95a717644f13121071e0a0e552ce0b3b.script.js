try {
    if (hasDuplicates()) {
        gs.log("sys_script_fix:95a717644f13121071e0a0e552ce0b3 - Duplicates found, proceeding with clean-up");
        cleanUpHermesClusterConfig();
        createConfig();
    } else {
        gs.log("sys_script_fix:95a717644f13121071e0a0e552ce0b3 - Clean-up not required, no duplicates found");
    }
} catch (e) {
    gs.log(e);
}

function hasDuplicates() {
    var gr = new GlideAggregate('hermes_cluster_config');
    gr.groupBy('data_center');
    gr.addAggregate("COUNT", "data_center");
    gr.addQuery('service_id', "IN", "bfe548804320311041a0e8625ab8f242,''");
    gr.addQuery('owner_instance_name', "");
    gr.query();
    var dups = [];
    while (gr.next()) {
        var count = gr.getAggregate("COUNT", "data_center");
        if (count != 1) {
            dups.push(gr.getValue("data_center"));
        }
    }
    if (dups.length != 0)
        return true;

    return false;
}

function cleanUpHermesClusterConfig() {
    gs.log("sys_script_fix:95a717644f13121071e0a0e552ce0b3 - Removing existing hermes_cluster_config entries, service_id is null or hermes-internal AND owner_instance_name is null");
    //find entries to remove; 'hermes-internal' is the default service
    //service_id=bfe548804320311041a0e8625ab8f242^owner_instance_name=NULL
    var hermesClusterConf = new GlideRecord('hermes_cluster_config');
    hermesClusterConf.addEncodedQuery("service_id=^ORservice_id=bfe548804320311041a0e8625ab8f242^owner_instance_nameISEMPTY");
    hermesClusterConf.query();
    hermesClusterConf.deleteMultiple();
}

function createConfig() {
    gs.log("sys_script_fix:95a717644f13121071e0a0e552ce0b3 - Recreating hermes_cluster_config entries for hermes-internal service");
    //find service name to use
    //either 'hermes' or 'hermes-internal'
    //as both clusters endpoints should be the same either service can be used
    //service name is what is used for refreshInCluster(...); need to use service that exists
    var serviceName = 'hermes-internal';
    var serviceGR = new GlideRecord('sys_service');
    //either 'hermes' or 'hermes-internal'
    serviceGR.addEncodedQuery("sys_id=2e269051b71201109fed8481de11a9c0^ORsys_id=bfe548804320311041a0e8625ab8f242");
    serviceGR.query();
    while (serviceGR.next()) {
        gs.log("Service found: " + serviceGR.name);
        serviceName = serviceGR.name;
    }

    //run refreshInCluster for found service to recreate endpoints.
    new sn_internal_services.ServiceConfig.refreshInCluster(serviceName);

    var hermesClusterConf = new GlideRecord('hermes_cluster_config');
    hermesClusterConf.addEncodedQuery("service_id=bfe548804320311041a0e8625ab8f242^owner_instance_nameISEMPTY");
    hermesClusterConf.query();
    if (hermesClusterConf.next()) {
        gs.log("sys_script_fix:95a717644f13121071e0a0e552ce0b3 - hermes_cluster_config entries for hermes-internal service exist");
    }
}
