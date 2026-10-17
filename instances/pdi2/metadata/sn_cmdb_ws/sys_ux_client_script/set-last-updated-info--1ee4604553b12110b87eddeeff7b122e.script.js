/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        formatLastUpdInfoText
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    if (api.data.cis_processed_by_ire_last_updated_info.results && api.data.cis_processed_by_ire_last_updated_info.results[0]) {
        const {
            sys_updated_on: {
                displayValue: cisProcessedLastUpdInfo
            },
        } = api.data.cis_processed_by_ire_last_updated_info.results[0];
        api.setState('cisProcessedLastUpdInfo', await formatLastUpdInfoText(helpers, cisProcessedLastUpdInfo));
    }
}
