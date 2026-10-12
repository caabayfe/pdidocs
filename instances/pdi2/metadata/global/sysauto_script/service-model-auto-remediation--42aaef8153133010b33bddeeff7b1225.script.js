var MAX_SERVICES_TO_REMEDIATE = gs.getProperty("svc.model.remediation.max_services_to_remediate", 100);
var MAX_ASSOCS_TO_DELETE = gs.getProperty("svc.model.remediation.max_assocs_to_delete", 100000);
var LOG_SOURCE = "Service Model Auto Remediation";

var manager = new SNC.ServiceModelingIntegrationManager();
var modelingUtils = SNC.ServiceModelingUtils.initWithDefaultUtil();

remediateServices();
cleanBrokenAssociations();

function remediateServices() {
    var count = 0;
	var layerGr = new GlideRecord('svc_layer');
    var envGr = new GlideRecord('svc_environment');
    var bsGr = new GlideRecord('cmdb_ci_service_discovered');
	bsGr.addNotNullQuery('type');
	bsGr.addQuery('type', '!=', '7'); //skip unified service
    bsGr.query();

    while (bsGr.next() && count < MAX_SERVICES_TO_REMEDIATE) {

        if (isInvalidServiceModel(bsGr, layerGr, envGr)) {
            gs.log("No valid layer/enviroment linked to service " + bsGr.getUniqueValue() + ", resetting the service model and marking for recomputation", LOG_SOURCE);
            reset(bsGr);
            count++;
        }
    }

    if (count > 0) {
        gs.log("Fixed " + count + " service models", LOG_SOURCE);
    }
}

function isInvalidServiceModel(gr, layerGr, envGr) {
	if (modelingUtils.isModelDisabled(gr.getUniqueValue()))
		return false; //skip model-less services

    var layer = getLayerId(gr);
    return !layer || !layerGr.get(layer) || !gr.layer.environment || !envGr.get(gr.layer.environment);
}

function reset(bsGr) {
    remove(bsGr);
    create(bsGr);
}

function remove(bsGr) {
    var layerId = getLayerId(bsGr);

    if (layerId) {
        // Here we force removal, i.e. we ignore the sa.service_modeling.use flag
        manager.forceRemoveBusinessService(bsGr);
    }
}

function create(bsGr) {
    var svcSysId = bsGr.getUniqueValue();
    manager.createBusinessService(bsGr);

    // createBusinessService works on a copy of the gr provided to it, so we need to reload the gr after it runs
    bsGr = new GlideRecord('cmdb_ci_service_discovered');
    bsGr.get(svcSysId);

    addEntryPoints(bsGr);
}

function addEntryPoints(bsGr) {
    var bsId = bsGr.getUniqueValue();
    var m2mgr = new GlideRecord('sa_m2m_service_entry_point');
    m2mgr.addQuery('cmdb_ci_service', bsId);
    m2mgr.query();

    var hasEPs = false;

    while (m2mgr.next()) {
        manager.addEntryPoint(bsId, m2mgr.getValue('cmdb_ci_endpoint'));
        hasEPs = true;
    }
    if (hasEPs) {
        requestRecomputation(bsGr);
    }

}

function getLayerId(bsGr) {
    return bsGr.getValue('layer');
}

function requestRecomputation(bsGr) {
    try {
        var env = sn_svcmod.ServiceContainerFactory.loadEnvironment(bsGr.layer.environment);
        var layers = env.layers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            layer.markRecomputationNeeded();
        }
        var time = new GlideDateTime();
        env.markRecomputationNeeded(time);
    } catch (error) { // if there's no enviroment linked
        gs.error(error, LOG_SOURCE);
        gs.log("Due to error, didn't mark service " + bsGr.getUniqueValue() + " for recomputation", LOG_SOURCE);
    }
}

function cleanBrokenAssociations() {
    var count = 0;
    var batchSize = Math.min(1000, MAX_ASSOCS_TO_DELETE);
    var assocGr = new GlideRecord('svc_model_assoc_ci');

    // Perform the deletion in batces of 1000
    // look for records with reference to environment that no longer exists
    while (count < MAX_ASSOCS_TO_DELETE) {
        assocGr.initialize();
        assocGr.addNullQuery('environment.sys_id').addOrCondition('ci_id.sys_id', 'NULL');
        assocGr.setLimit(batchSize);
        assocGr.query();

        var brokenAssocsFound = assocGr.getRowCount();
        if (brokenAssocsFound == 0) break;

        count += brokenAssocsFound;
        assocGr.deleteMultiple();
    }

    if (count > 0)
        gs.log("Deleted " + count + " broken association" + (count > 1 ? "s" : ""), LOG_SOURCE);
}
