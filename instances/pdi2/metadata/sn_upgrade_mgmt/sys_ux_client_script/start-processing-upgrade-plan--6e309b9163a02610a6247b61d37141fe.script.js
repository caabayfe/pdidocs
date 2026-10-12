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
    console.log("button clicked");
    // api.setState("isPreviewTableLoading", true);
    api.setState("isProcessing", true);
    api.setState("columnData", api.state.disabledColumnData);

    // refresh start_processing_upgrade_plan_1
    api.setState("processParams", {
        "upgrade_plan_sysid": api.context.props.experienceProperties.upgrade_plan_sysid.value,
        "upgrade_session_id": api.context.props.experienceProperties.upgrade_session_id.value,
        "first_load": false
    });

    // if (api.state.upgradePlanSysId !== api.context.props.experienceProperties.upgrade_plan_sysid.value)

    // else
    //     api.data.start_processing_upgrade_plan_1.refresh();
}
