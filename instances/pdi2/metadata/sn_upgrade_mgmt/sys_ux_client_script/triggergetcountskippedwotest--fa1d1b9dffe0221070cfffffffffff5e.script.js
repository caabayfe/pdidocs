/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const records = api.data.look_up_multiple_records_3.results || [];
    let updatedRecords = [];
    for (let i = 0; i < records.length; i++) {
        updatedRecords.push({
            'sys_id': records[i].a_sys_id
        });
    }

    api.setState('skipsToGetCountWOTests', updatedRecords);
    api.data.get_count_of_skipped_records_without_tests_1.refresh();
}
