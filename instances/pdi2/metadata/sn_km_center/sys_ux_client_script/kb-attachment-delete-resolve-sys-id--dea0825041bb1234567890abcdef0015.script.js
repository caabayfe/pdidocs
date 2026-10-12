/**
 * Fires on DELETE_SUCCEEDED before the DATABROKER_OP REFRESH.
 * The DELETE payload always carries the real article sys_id (even when the page URL
 * still shows a new-record placeholder), so we store it in resolvedSysId state.
 * The TRANSFORM then uses resolvedSysId as a fallback when sysId prop is a temp id.
 *
 * Note: DELETE_SUCCEEDED payload uses camelCase (sysId) for the article sys_id — this is
 * the actual shape from NOW_RECORD_COMMON_ATTACHMENT_CONNECTED, distinct from
 * UPLOAD_SUCCEEDED which uses snake_case (sys_id) for the attachment sys_id.
 */
function handler({ api, event }) {
    var sysId = event.payload && event.payload.sysId;
    if (sysId) {
        api.setState('resolvedSysId', sysId);
    }
}
