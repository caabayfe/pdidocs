/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { ACTION } = imports["global.DMClientConstants"]();

    var { related_records } = event.payload;
    var archiveRelatedSysIDs = Object.keys(related_records);
    if(!archiveRelatedSysIDs.length) return;

    var archiveRelatedRecord = {
        related_record: archiveRelatedSysIDs,
        action: ACTION.DELETE
    };
    api.data.update_archive_related_rule.execute(archiveRelatedRecord);
}
