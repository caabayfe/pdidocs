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
    if (event.payload.wrapped_payload.referenceInfoClick) {
        let referenceInfo = event.payload.wrapped_payload.referenceInfoClick;
        let recordURL = null;
        if (referenceInfo.referencetable == 'comm_plan_definition') {
            recordURL = "now/sow-admin/mim-setup-communications-update-plan" + "/" + referenceInfo.sys_id;
        } else {
            recordURL = "now/sow-admin/record/" + referenceInfo.referencetable + "/" + referenceInfo.sys_id;
        }
        helpers.navigate.to(null, null, null, false, false, null, {
            url: recordURL
        });
    }
}
