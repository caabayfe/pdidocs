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

    const simUtil = imports["sn_access_analyzer.AccessSimulatorUtil"](api);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const {
        navigate,
        navTo
    } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const gtt = imports["sn_access_analyzer.GlideTextTranslater"](api);
    const SubPageEvent = subPageHandler.SubPageEvent;
    let gvar = api.state.gvar;

    function onPageReady(payload) {
        simUtil.showLoader();
        gvar.action = payload.pageParams.action;
        gvar.request = payload.dataSet.criteria.request;
        gvar.groupOrRoleId = gvar.action.endsWith("role") ? gvar.request.role.id : gvar.request.group.id;
        
        gtt.translate({
            User: helpers.translate("User"),
            Group: helpers.translate("Group"),
            Role: helpers.translate("Role"),
            being: helpers.translate("being"),
            added: helpers.translate("added"),
            removed: helpers.translate("removed"),
            unchanged: helpers.translate("unchanged"),
            serverErrorHeading: helpers.translate("Server error!"),
            serverErrorContent: helpers.translate("The server encountered an internal error and couldn't process your request. Please try again later."),
            serverErrorRetryAction: helpers.translate("Retry"),
            overloadErrorHeading: helpers.translate("Sorry, there are too many nodes to show"),
            overloadErrorContent: helpers.translate("Click below to view the resource on the platform."),
            layeredGroup: helpers.translate("Change layout to Layered Groups"),
            hierarchialTopdown: helpers.translate("Change layout to Hierarchical top down")
        }).then( transMsg => {
            resetMapLayout(transMsg);
            let apiResponseCache = payload.dataSet.previewChanges.apiResponseCache;
            if (apiResponseCache)
                simUtil.emitActionPerformed("UPDATE_MAP", apiResponseCache);
            else
                refreshMap();
        });
    }

    function resetMapLayout(transMsg) { 
        api.setState("mapData", ctx => {
            let cv = { ...ctx.currentValue};
            cv.customButtons[0].tooltipContent = transMsg.layeredGroup;
            cv.customButtons[1].tooltipContent = transMsg.hierarchialTopdown;
            cv.customButtons[0].disabled = true;
            cv.customButtons[1].disabled = false;
            return cv;
        });
        
    }

    function refreshMap() {
        subPageHandler.showLoader();
        simUtil.getSimulatedChanges("simulatorDB", gvar.request.user.id, gvar.action, gvar.groupOrRoleId);
    }

    const emptyStateHandler = () => {
        const action = event.payload.action;
        if (action.name == 'open_link') {
            navigate({
                external: navTo(action.tableName, action.id)
            });
        } else {
            refreshMap();
        }
    };

    subPageHandler.onReceive(SubPageEvent.PAGE_READY, onPageReady);
    subPageHandler.handle(event);

    simUtil.execute({
        emptyState: emptyStateHandler
    }, event);

}
