/**
 * Fires on UPLOAD_SUCCEEDED. Appends the new attachment directly to attachmentLinkList
 * state using the event payload, so it works even on new articles where the macroponent's
 * sysId prop is still a temp placeholder (-1_uid_*) and the TRANSFORM can't resolve it.
 *
 * Note: UPLOAD_SUCCEEDED payload uses snake_case (sys_id, file_name) — this is the
 * actual shape from NOW_RECORD_COMMON_ATTACHMENT_CONNECTED, distinct from DELETE_SUCCEEDED
 * which uses camelCase (sysId) for the article sys_id.
 */
function handler({ api, event }) {
    var payload = event.payload || {};
    var sysId = payload.sys_id;
    var fileName = payload.file_name || payload.fileName || payload.name || sysId;
    if (!sysId) { return; }
    var current = Array.isArray(api.state.attachmentLinkList) ? api.state.attachmentLinkList : [];
    api.setState('attachmentLinkList', current.concat([{
        title: fileName || '',
        value: 'sys_attachment.do?sys_id=' + sysId
    }]));
}
