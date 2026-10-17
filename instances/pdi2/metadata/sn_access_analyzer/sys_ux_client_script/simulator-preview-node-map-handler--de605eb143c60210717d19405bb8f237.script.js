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
    const {
        ViewChangesNodeMap
    } = imports["sn_access_analyzer.UserRoleMapUtil"](api);
    const translatedMessage = api.state.translatedMessage;
    let gvar = api.state.gvar;
    const nodeMap = new ViewChangesNodeMap();

    function simulatorDBResponseHandler() {
        if (simUtil.hasServerError(event)) {
            subPageHandler.hideLoader();
            const emptyStateObj = getEmptyStateData(translatedMessage.serverErrorHeading, translatedMessage.serverErrorContent, "error", [{
                "variant": "primary",
                "label": translatedMessage.serverErrorRetryAction
            }]);
            api.setState('emptyState', emptyStateObj);
            simUtil.updateComponentProps("hasServerError", true);
            return;
        }

        let result = event.payload.data.output.result;

        if (result.errorCode) {
            var groupOrRole;
            if (gvar.action.endsWith("role"))
                groupOrRole = {
                    ...gvar.request.role,
                    tableName: 'sys_user_role'
                };
            else
                groupOrRole = {
                    ...gvar.request.group,
                    tableName: 'sys_user_group'
                };
            const translatedMessage = api.state.translatedMessage;

            const emptyStateObj = getEmptyStateData(translatedMessage.overloadErrorHeading, translatedMessage.overloadErrorContent, "interrupted", [Object.assign({
                "name": "open_link",
                "variant": "secondary",
                "icon": "open-link-right-outline"
            }, groupOrRole)]);

            api.setState('emptyState', emptyStateObj);
            simUtil.updateComponentProps("hasServerError", true);
            subPageHandler.hideLoader();
            return;
        }
        subPageHandler.storeData("apiResponseCache", result);
        updateMap(result);
    }

    const getEmptyStateData = (heading, content, illustration, actions) => ({
        heading: {
            label: heading,
            level: 3
        },
        illustration: illustration,
        content: content,
        actions: actions
    });

    function updateMap(response) {
        simUtil.updateComponentProps("hasServerError", false);
        simUtil.updateComponentProps("mapRendered", true);
        subPageHandler.hideLoader();

        let user = {
            id: gvar.request.user.id,
            name: gvar.request.user.label,
            type: "USER"
        };

        const stats = nodeMap.getStats(response);
        let mapData = nodeMap.getRoleMap(user, response);

        // Update with translated text
        mapData.nodes.forEach(node => node.viewData.secondaryLabel = translatedMessage[node.viewData.secondaryLabel]);

        simUtil.updateState("mapData", mapData);
        updateLegendStatus(stats);
    }

    function updateLegendStatus(stats) {
        simUtil.updateComponentProps({
            addedNodesCount: stats.ADDED,
            removedNodesCount: stats.REMOVED,
            unchangedNodesCount: stats.UNCHANGED
        });
    }

    function actionPerformedHandler() {
        switch (event.payload.eventName) {
            case "UPDATE_MAP":
                updateMap(event.payload.eventPayload);
                break;
        }
    }

    function nodeMapHandler() {
        switch (event.name) {
            case "SN_NODE_MAP#ELEMENT_SELECTION_REQUESTED":
                if (event.payload.node)
                    nodeMap.selectNode(event.payload.node.id);
                break;
            case "SN_NODE_MAP#MAP_VIEW_READY":
                nodeMap.selectNode(gvar.groupOrRoleId, true);
                break;
        }
    }

    simUtil.execute({
        simulatorDB: simulatorDBResponseHandler,
        SIMULATOR_ACTION_PERFORMED: actionPerformedHandler,
        nodeMap: nodeMapHandler
    }, event);

}
