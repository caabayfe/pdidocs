async function handler({api, event, helpers, imports}) {
    const {
        APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH,
        formatDurationMilliSeconds
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const durationUnits = {
        s: await helpers.translate('seconds'),
        m: await helpers.translate('minutes'),
        h: await helpers.translate('hours'),
        d: await helpers.translate('days')
    };
    
    const {
        certSchsNotMigratedCount,
        in_progress: inProgressCount,
        completed: completedCount,
        failed: failedCount,
        skipped_security_constraints: skippedCount,
        progressInfo
    } = api.data.data_manager_get_cert_schedules_counts?.output;

    let hideImportCertSchsInfoMsg = true;
    let hideImportCertSchsProgressInfoMsg = true;
    let hideViewDraftCertPoliciesInfoMsg = true;
    let hideViewDraftPoliciesBtn = true;

    if (inProgressCount > 0) {
        hideImportCertSchsProgressInfoMsg = false;
        api.setState("importCertSchsModalState", "importInProgress");
        api.setState("importCertSchsModalHeading", await helpers.translate("Import in progress"));

        if (api.state.importCertSchsProgressId == "" && progressInfo && Object.keys(progressInfo).length > 0) {
            api.setState("importCertSchsTotalCount", progressInfo.totalCount);
            let apprxTimeToImport = formatDurationMilliSeconds(progressInfo.remainingCount * APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH, {count: 1, units: durationUnits}, true);
            api.setState("apprxTimeToImportCertSchs", apprxTimeToImport);
            
            api.setState("importCertSchsProgressId", progressInfo.id);
        }
    } else  if (certSchsNotMigratedCount > 0) {
        hideImportCertSchsInfoMsg = false;

        let apprxTimeToImport = formatDurationMilliSeconds(certSchsNotMigratedCount * APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH, {count: 1, units: durationUnits}, true);
        let msg = await helpers.translate("Import certification schedules into Data Manager. Importing the existing {0} certification schedules into Data Manager converts them into draft Certification policies that you can then publish. This import is estimated to take approximately {1}.", certSchsNotMigratedCount, apprxTimeToImport);

        api.setState("importCertSchsInfoMsg", msg);
        api.setState("importCertSchsTotalCount", certSchsNotMigratedCount);
        api.setState("apprxTimeToImportCertSchs", apprxTimeToImport);
        
        api.setState("importCertSchsModalState", "confirmImport");
        api.setState("importCertSchsModalHeading", await helpers.translate("Confirm import of certification schedule into draft policies"));
    } else if (certSchsNotMigratedCount == 0 && api.state.importCertSchsModalState == "viewDraftPoliciesInfoMsg" ) {
        hideViewDraftCertPoliciesInfoMsg = false;
        // reset it to empty to avoid showing view draft policies info message again.
        api.setState("importCertSchsModalState", "");
    }

    if (api.state.importCertSchsProgressPercent == 100) {
        let summaryObj = {};
        summaryObj.completed= await helpers.translate("Completed : {0}", completedCount);
        summaryObj.completedCount = parseInt(completedCount);
        summaryObj.failed = await helpers.translate("Failed : {0}", failedCount);
        summaryObj.failedCount = parseInt(failedCount);
        summaryObj.skipped = await helpers.translate("Skipped : {0}", skippedCount);
        summaryObj.skippedCount = parseInt(skippedCount);
       
       if (parseInt(completedCount) > 0) { 
            hideViewDraftPoliciesBtn = false;
       }

        api.setState("importCertSchsSuccessSummary", summaryObj);
        api.setState("importCertSchsModalState", "importSuccessful");
        api.setState("importCertSchsModalHeading", await helpers.translate("Import summary"));
    }
    
    api.setState("hideImportCertSchsInfoMsg", hideImportCertSchsInfoMsg);
    api.setState("hideImportCertSchsProgressInfoMsg", hideImportCertSchsProgressInfoMsg);
    api.setState("hideViewDraftCertPoliciesInfoMsg", hideViewDraftCertPoliciesInfoMsg);
    api.setState("hideViewDraftPoliciesBtn", hideViewDraftPoliciesBtn);
}
