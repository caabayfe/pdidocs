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

    var data = api.context.props.payload.children.length;
    let screenData = api.context.props.payload.children;
    let chevronSide = event.elementId;
    let screenId = parseInt(api.state.activeScreen);

    if (chevronSide == 'chevron_right') {
        screenId += 1;
    }
    if (chevronSide == 'chevron_left') {
        screenId -= 1;
    }
    api.setState("activeScreen", screenId);
    api.setState("currentScreenData", screenData[screenId]);
    api.setState("actionsData", []);
    helpers.timing.setTimeout(function() {
        api.setState("actionsData", screenData[screenId].children);
    }, 100);

    api.setState("splitButtonActionData", screenData[screenId].splitButtonActionData);
}
