function transform(input) {

    var padUtils = new global.PADUtilsSI();
    var setupMigrationUtil = new sn_ads_setup.SNHelpSetupMigrationUtil();
    var pdProcessService = new global.PDProcessService();
    var snHelpService = new global.SNHelpService();
    var constants = new sn_ads_setup.SNHelpSetupConstantProvider();
    var result = {
        'setups': [],
        'errors': []
    };
    var activeResponse = {};
    const setupId = input.setupId;

    var hg = new GlideRecord('help_guidance');
    hg.addActiveQuery();
    hg.addQuery('type', 'global_setup');
    hg.addNullQuery('process_definition');
    if (setupId) {
        hg.addQuery('sys_id', setupId);
    }
    snHelpService.setWorkflowFromDiffScope(hg, false);
    hg.query();

    if (hg.getRowCount() <= 0)
        return result;

	var domainID = snHelpService.fetchDomain();
	if (domainID != 'global') {
		result.errors.push('Guided setup needs some update. Please start in Global domain.');
		return result;
	}
    
    if (!padUtils.isPADAuthorizedUser() && !padUtils.userIsPADDelegatedDev()) {
        result.errors.push('An error occurred while migrating setup: User not authorised');
        return result;
    }

    gs.info('Guided Setup Migration to PAD: Started');

    while (hg.next()) {
        var guidanceId = hg.getUniqueValue();
        try {
            var processId = gs.generateGUID();
            var processMetaDataObj = setupMigrationUtil.getProcessMetaData(hg, processId);

            var createdProcess = pdProcessService.createProcess({
                process: processMetaDataObj.process,
                lanes: processMetaDataObj.lanes,
                activities: processMetaDataObj.activities
            });
            hg.setValue('process_definition', createdProcess.process.sys_id.value);

            if (hg.getValue('status') == constants.setupStatus.PUBLISHED)
                activeResponse = sn_pad.PDAutomationProvider.activateProcess(createdProcess.process.sys_id.value);

            setupMigrationUtil.deleteInteractionRecords(guidanceId);

            if (activeResponse.state == "SUCCESS") {
                result.setups.push(guidanceId);
                gs.info('Guided Setup Migrated And Published Successfully! ' + guidanceId);
            } else if (activeResponse.errors) {
                var stepErrors = activeResponse.errors.join(',');
                gs.info('Error occurred during activation of Guided Setup! ' + guidanceId + 'Errors: ' + stepErrors);
                hg.setValue('status', constants.setupStatus.DRAFT);
            }
            hg.update();
        } catch (e) {
            gs.error('An error occurred while migrating setup: ' + guidanceId + ' Error:' + e.message);
            result.errors.push('Migration Failed:' + hg.sys_name + ', Please contact your administrator!');
        }
    }

    gs.info('Guided Setup Migration to PAD: Finished');
    return result;
}
