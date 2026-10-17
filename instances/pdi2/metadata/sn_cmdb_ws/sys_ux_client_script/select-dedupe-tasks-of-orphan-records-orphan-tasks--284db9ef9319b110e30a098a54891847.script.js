/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let rows = api.data.look_up_records_Task_From_Orphan.results;
    if (!rows || rows.length == 0)
        return;
    let sysIds = rows.map((row) => row.task.value);
    if (!sysIds || sysIds.length == 0)
        return;
    let query = 'sys_idIN'+ sysIds.join();
    api.setState('selectedDedupeTaskForOrphanRecordsQuery', query);
}
