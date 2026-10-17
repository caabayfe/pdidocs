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
    const slaColorLevelCopy = { ...api.state.slaColorLevel};
    const slaImageCopy = { ...api.state.slaImage};
    let isSLABreachColor = api.state.isSLABreachColor;
    let indexToUpdate = event.context.item.index; // Get current SLA index
    if (indexToUpdate !== undefined && slaColorLevelCopy.items[indexToUpdate]) {
        const slaValue = event.payload.selectedColor.id;
        slaColorLevelCopy.items[indexToUpdate].slaColor.value = slaValue; // Update sla color
        slaImageCopy.items[indexToUpdate].imageSource = `${slaValue}_light_theme_tab.png`;
    }
    slaColorLevelCopy.items.forEach(item => item.isInvalid = false);
    isSLABreachColor = false;
    for (let i = 0; i < slaColorLevelCopy.items.length - 1; i++) {

        if (slaColorLevelCopy.items[i].slaColor.value === slaColorLevelCopy.items[i + 1].slaColor.value) {
            slaColorLevelCopy.items[i].isInvalid = true;
            slaColorLevelCopy.items[i + 1].isInvalid = true;
            isSLABreachColor = true;
        }
        if (i == 0 && slaColorLevelCopy.items.length > 2) {
            if (slaColorLevelCopy.items[i].slaColor.value === slaColorLevelCopy.items[i + 2].slaColor.value) {
                slaColorLevelCopy.items[i].isInvalid = true;
                slaColorLevelCopy.items[i + 2].isInvalid = true;
                isSLABreachColor = true;
            }
        }
    }
    api.setState('slaColorLevel', slaColorLevelCopy);
    api.setState('slaImage', slaImageCopy);
    api.setState('isSLABreachColor', isSLABreachColor);
}
