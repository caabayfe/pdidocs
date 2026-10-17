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

    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const translatedMessage = api.state.translatedMessage;
    const gvar = api.state.gvar;

    /**
     * Change map layout
     * 1. Layered Groups (Default)
     * 2. Hierarchal topdown
     */
    function changeMapLayout(buttonId) {
        let layout, disableIndex;
        if (buttonId == "mapLayoutLayeredGroups") {
            layout = "layered-groups";
            disableIndex = 0;
        } else {
            layout = "hierarchical-topdown";
            disableIndex = 1;
        }
        api.setState("mapData", ctx => {
            let cv = { ...ctx.currentValue};
            cv.mapLayout = layout;
            cv.alignNodeId = null;
            cv.customButtons[disableIndex].disabled = true;
            cv.customButtons[disableIndex == 0 ? 1 : 0].disabled = false;
            return cv;
        });
    }

    function nodeMapHandler() {
        if (event.name != "SN_NODE_MAP#CONTROL_PANEL_CUSTOM_BUTTON_CLICKED")
            return;
        switch (event.payload.buttonId) {
            case "mapLayoutLayeredGroups":
            case "mapLayoutHierarcialTopdown":
                changeMapLayout(event.payload.buttonId);
                break;
        }
    }

    simUtil.execute({
        nodeMap: nodeMapHandler
    }, event);

}
