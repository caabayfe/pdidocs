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
    if(api.data.in_progress_upgrade_session.results && api.data.in_progress_upgrade_session.results?.length > 0) {
        const data = api.data.in_progress_upgrade_session.results?.[0];
        api.setState("currentVersion", data?.current_patch_label?.value);
        api.setState("currentVersionZip", data?.current_patch_id?.value);
        api.setState("targetVersion", data?.target_patch_label?.value);
        api.setState("targetVersionZip", data?.target_patch_id?.value);
        api.setState("patch", data?.sys_id?.value);
    }
    api.setState("homeLoader", 0);

}
