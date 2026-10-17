(function executeRule(current, previous /*null when async*/) {

    var gr = new GlideRecord(ExperimentationConstants.EXPERIMENT_TABLE);
    gr.addQuery("sys_id", current.experiment);
    gr.query();
    gr.next();
    
    sn_scoped_cache.ScopedCacheManager.flushScopedCache("experiments_cache", gr.getValue("key"));

})(current, previous);
