function doGreatThings() {
    try {

        if (current.selected_config == null || current.selected_config == '') {
            gs.addErrorMessage(gs.getMessage('No selected configurations.'));
            return;
        }

        var searchApplicationsToMigrate = current.selected_config.split(',');
        var searchApplicationName = current.getDisplayValue("selected_config");
        gs.info('Selected Search Application Configs : ' + searchApplicationName + ' ' + searchApplicationsToMigrate);
        (new sn_aisearch_global.AISConverter(current.sys_id)).convertContexts(searchApplicationsToMigrate, searchApplicationName);

        var stagedRecords = new GlideRecord('sn_aisearch_global_job_staging');
		stagedRecords.addQuery('migration_orchestration', current.sys_id);
        stagedRecords.setLimit(1);
        stagedRecords.query();

        if (stagedRecords.hasNext())
            current.setValue("state", "CONFIGURATION_CONVERTED");
        else
            current.setValue("state", "MIGRATION_FAILED");

        current.setValue("started", new GlideDateTime());
        current.update();

    } catch (e) {
        var logger = new AisMigrationLogger(current.sys_id, 'Converter');
        gs.addErrorMessage(gs.getMessage('One or more errors encountered. Check the migration logs'));
        logger.error(e);
		current.setValue("state", "MIGRATION_FAILED");
		current.update();

    }


}
doGreatThings();
if (!current.isActionAborted()) action.setRedirectURL(current);
