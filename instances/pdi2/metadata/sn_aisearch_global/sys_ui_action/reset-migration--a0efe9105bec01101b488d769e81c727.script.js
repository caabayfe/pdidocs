current.setValue("state", "NOT_MIGRATED");
current.setValue("started", null);
current.setValue("completed", null);
current.setValue("selected_config", null);
current.update();

try {
    var reverter = new AisMigrationReverter(current.getUniqueValue());
    reverter.revertAll();
} catch (e) {
    gs.error("Failed to revert. Continuing reset anyway.", e);
}

var gr1 = new GlideRecord('sn_aisearch_global_job_log');
gr1.addQuery('sn_aisearch_global_migration_job', current.getUniqueValue());
gr1.query();
gr1.deleteMultiple();

var gr2 = new GlideRecord('sn_aisearch_global_job_staging');
gr1.addQuery('migration_orchestration', current.getUniqueValue());
gr2.query();
gr2.deleteMultiple();

if (!current.isActionAborted()) action.setRedirectURL(current);
