var baseSol = new GlideRecord("ml_capability_definition_base");
baseSolQ = baseSol.addQuery("capability.value", "clustering_trainer");
baseSolQ.addOrCondition("capability.value", "similarity_trainer");
baseSolQ.addOrCondition("capability.value", "workflow_clustering_trainer");
baseSolQ.addOrCondition("capability.value", "workflow_similarity_trainer");
baseSol.query();
while (baseSol.next()) {
    var sysautoGr = new GlideRecord("sysauto_script");
    sysautoGr.addQuery("name", baseSol.sys_id);
    sysautoGr.query();
    while (sysautoGr.next()) {
        sysautoGr.setValue("name", baseSol.solution_name);
        sysautoGr.update();
    }
}
