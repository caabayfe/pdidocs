function updateCounters() {
    if (GlidePluginManager.isActive('com.snc.service-mapping')) {
        var updater = new UpdateServiceMappingCounts();
        updater.updateCounts();
        var errManager = new sn_svcerr.ErrorMgrScript("58c8d0ef9f6232000f51b7bda42e7017"); /* service mapping */
        errManager.updateAllCounts();
    }
}

function asyncSvcCiAssocPopulation() {
    gs.log("*** About to synchronize svc_ci_assoc ***");
    var manager = new SNC.SvcAssocPopulationManager();
    var numOfUpdates = manager.numberOfUpdates;
    var timesFullSync = GlideProperties.getInt("sa.svc_ci_assoc.full_sync_after_n_times", 24 * 12);
    var timesIncSync = GlideProperties.getInt("sa.svc_ci_assoc.inc_sync_after_n_times", 6);
    if ((numOfUpdates % timesFullSync) == 0) {
        manager.fullSync();
        updateCounters();
    } else if ((numOfUpdates % timesIncSync) == 0) {
        /* If 30 minutes passed, run incremental */
        manager.incrementalSync();
        updateCounters();
    } else {
        /* if indicator in sa_hash is on, run incremental */
        var saHashGr = new GlideRecord('sa_hash');
        saHashGr.addQuery('name', 'incr_upd_svc_ci_assoc_required');
        saHashGr.addQuery('hash', 'true');
        saHashGr.query();
        if (saHashGr.next()) {
            manager.incrementalSync();
            updateCounters();
            saHashGr.setValue('hash', 'false');
            saHashGr.update();
        }
    }

    /* Increment the number of svc_ci_assoc updates */
    manager.incrementSvcCiAssocUpdates();
    gs.log("*** Done synchronizing svc_ci_assoc ***");
}

if (gs.getProperty('sa.svc_ci_assoc.synchronous_population_enabled', 'true') == 'true') {
	// Since svc_ci_assoc is populated synchronously, just update the counters for Error Framework (Service Mapping feature)
	updateCounters();
} else {
	asyncSvcCiAssocPopulation();
}
