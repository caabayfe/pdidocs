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
    const repeaterLevelCopy = { ...api.state.repeaterLevel};
    let isSlaBreach = api.state.isSLABreach;
    let indexToUpdate = event.context.item.index; // Get current SLA index
    if (indexToUpdate !== undefined && repeaterLevelCopy.items[indexToUpdate]) {
        const slaValue = api.state.labelCountMap[event.payload.value];
        repeaterLevelCopy.items[indexToUpdate].slaThreshold = slaValue; // Update threshold
    }
    repeaterLevelCopy.items.forEach(item => item.isValid = false);
    isSlaBreach = false;
    for (let i = 0; i < repeaterLevelCopy.items.length; i++) {
        if ((i === 0 && repeaterLevelCopy.items[i].slaThreshold === undefined) || (i > 0 && (
                repeaterLevelCopy.items[i].slaThreshold === undefined ||
                repeaterLevelCopy.items[i - 1].slaThreshold === undefined ||
                repeaterLevelCopy.items[i].slaThreshold <= repeaterLevelCopy.items[i - 1].slaThreshold))) {
            repeaterLevelCopy.items[i].isValid = true;
            isSlaBreach = true; // Mark invalid SLA levels
        } else {
            repeaterLevelCopy.items[i].isValid = false; // Mark valid SLA levels
        }
    }

    api.setState('repeaterLevel', repeaterLevelCopy);
    api.setState('isSLABreach', isSlaBreach);
}
