/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let initialData = api.state.initialData;
    let currentData = api.state.tmpCIRm2mPO;

    if (
        initialData.active == currentData.active &&
        initialData.po_project_id == currentData.po_project_id
    ) {
        return true;
    } else {
        if (!currentData.po_project_id) {
            return true;
        } else {
            return false;
        }
    }
}
