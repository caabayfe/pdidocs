/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE } = imports["global.DMClientConstants"]();
    const previewCascadeState = deepClone(api.state[STATE.PREVIEW_CASCADE_DATA]);
    const previewCascadeData = api.data.preview_cascade_delete_records.output;
    if (!previewCascadeData) return;
    previewCascadeState.rowCount = previewCascadeData.rowCount;
    previewCascadeState.messages = previewCascadeData.messages;
    previewCascadeState.rows = previewCascadeData.rows;
    api.setState(STATE.PREVIEW_CASCADE_DATA, previewCascadeState);
}
