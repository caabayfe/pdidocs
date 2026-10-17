/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.index == 0 || api.item.index == api.state.timelineEvents.length - 1)
        return api.state.timelineEvents[api.item.index].formattedDateTime;

    let previousTimeComponent = api.state.timelineEvents[api.item.index - 1].formattedDateTime.split(' ');
    let currentTimeComponent = api.state.timelineEvents[api.item.index].formattedDateTime.split(' ');

    let diff = Math.abs(new Date(previousTimeComponent[0]) - new Date(currentTimeComponent[0]));
    if (diff == 0) {
        if (currentTimeComponent[2] != undefined)
            return currentTimeComponent[1] + " " + currentTimeComponent[2];
        else
            return currentTimeComponent[1];
    } else
        return api.state.timelineEvents[api.item.index].formattedDateTime;
}
