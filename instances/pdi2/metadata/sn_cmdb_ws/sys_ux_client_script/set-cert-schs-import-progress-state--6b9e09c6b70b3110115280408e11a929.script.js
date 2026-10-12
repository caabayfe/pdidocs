/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
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
    var progressPercent = api.state.importCertSchsProgressPercent;
    var importCertSchsProgressId = api.state.importCertSchsProgressId;
    if (!importCertSchsProgressId) {
        return;
    }
    if (event.payload.data) {
        if (event.payload.data.record) {
            if (event.payload.data.changes.includes('percent_complete')) {
                progressPercent = Number(event.payload.data.record.percent_complete.value);
                if (progressPercent == 1) {
                    api.data.data_manager_get_cert_schedules_counts.refresh();
                }
                api.setState('importCertSchsProgressPercent', progressPercent);
                
                let totalCount = api.state.importCertSchsTotalCount;
                let remainingCount = Number(totalCount) - Number(event.payload.data.record.processed_count.value);
                let apprxTimeToImport = formatDurationMilliSeconds(remainingCount * APPRX_TIME_TO_MIGRATE_ONE_CERT_SCH, {count: 1, units: durationUnits});
                api.setState("apprxTimeToImportCertSchs", apprxTimeToImport);
            }
        } else {
            progressPercent = 100;
            api.setState('importCertSchsProgressPercent', progressPercent);
            api.setState("importCertSchsModalState", "viewDraftPoliciesInfoMsg");
            api.data.data_manager_get_cert_schedules_counts.refresh();
        }
    }
}
