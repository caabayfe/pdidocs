/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var caseRecord = api.context.props.customExpProps.previewFields[0];
    var caseRecordParams = caseRecord.value['append-to-payload'];
     api.emit("RECORD#OPEN_COLLAB_CHAT", {
        fields: {
            "parentTable": caseRecordParams.table,
            "parentSysId": caseRecordParams.sys_id
        }
    });
}
