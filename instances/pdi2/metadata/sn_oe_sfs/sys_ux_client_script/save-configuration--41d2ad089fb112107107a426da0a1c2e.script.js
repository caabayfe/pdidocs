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
    const workSpaceId = api.state.workSpaceId;
    const isSessionTabEnabled = api.state.isSessionTabEnabled;
    const thresholdLevels = api.state.repeaterLevel;
    const slaColorLevel = api.state.slaColorLevel;
    const formattedThresholdLevels = JSON.stringify(thresholdLevels.items.map((item, index) => ({
        [`level_${index + 1}`]: {
            "SLATimer": item.slaThreshold,
            "color": slaColorLevel.items[index].slaColor.value
        }
})));

    if (event.elementId === "save_button") {
        api.setState("saveButtonClicked", "true");
    }
        api.data.update_information_session_workspace_settings_1.execute({
            workspaceId: workSpaceId,
            isSessionTabEnabled: isSessionTabEnabled,
            thresholdLevels: formattedThresholdLevels
        });
}
