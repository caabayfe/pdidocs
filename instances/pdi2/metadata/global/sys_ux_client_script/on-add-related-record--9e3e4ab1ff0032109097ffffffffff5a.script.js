/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { ACTION } = imports["global.DMClientConstants"]();
    
    var { related_record } = event.payload;
    var { action, reference, reference_rule } = related_record;
    var archive_sys_ID = api.state.ruleData.archive.sys_id;
    if(!(action || reference?.value || archive_sys_ID)) return;

    related_record.archive_sys_ID = archive_sys_ID; 

    var archiveRelatedRecord = {
        related_record: related_record,
        action: ACTION.ADD
    };
    api.data.update_archive_related_rule.execute(archiveRelatedRecord);
}
