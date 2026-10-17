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
const severityLevels = ["critical", "severe"];
    const colorLevels = ['warning','high','critical'];
    var tempLevelCount = api.state.countLevel;
    const repeaterLevel = api.state.repeaterLevel;
    const slaColorLevel = api.state.slaColorLevel;
    const slaImage = api.state.slaImage;
    if (event.context.item.value.buttonLabel === 'Add Level') {

        tempLevelCount += 1;
        api.setState('countLevel', tempLevelCount);
        if (tempLevelCount <= 3) {
            repeaterLevel.items.push({
                buttonLabel: "Remove Level",
                heading: "Timer for SLA breach warning (Level " + tempLevelCount + ")",
                typeaheadLabel: `Set timer to show a ${severityLevels[tempLevelCount - 2]} SLA breach (tab turns color) when the agent switches away from the current tab`,
                buttonVariant: "tertiary",
                slaThreshold: api.state.labelCountMap[api.state.dropDownValues[tempLevelCount - 1].label],
                isValid: false,
            });
            slaColorLevel.items.push({
                heading: "Threshold Tab Level " + tempLevelCount,
                isInvalid: false,
                slaColor:{"type":"id","value":`${colorLevels[tempLevelCount-1]}`},
            });
            slaImage.items.push({
                imageSource: `${colorLevels[tempLevelCount-1]}_light_theme_tab.png`,
            });
        }

    }
    if (event.context.item.value.buttonLabel === 'Remove Level') {
        var tempLevelCount = api.state.countLevel;
        let indexToRemove = event.context.item.index; // Find index of the clicked item in repeaterLevel.items
        if (indexToRemove > 0) {
            repeaterLevel.items.splice(indexToRemove, 1);
            slaColorLevel.items.splice(indexToRemove,1);
            slaImage.items.splice(indexToRemove,1);
            tempLevelCount -= 1;

            // Update the remaining SLAs dynamically
            for (let i = indexToRemove; i < repeaterLevel.items.length; i++) {
                repeaterLevel.items[i].heading = `Timer for SLA breach warning (Level ${i + 1})`;
                repeaterLevel.items[i].typeaheadLabel = `Set timer to show a ${severityLevels[i - 1]} SLA breach (tab turns color) when the agent switches away from the current tab`;
                slaColorLevel.items[i].heading = `Threshold Tab Level ${i+1}`;
            }
            api.setState('countLevel', tempLevelCount);
        }
    }

    repeaterLevel.items.forEach(item => item.isValid = false);
    let isSlaBreach = api.state.isSLABreach;
    let isSLABreachColor = api.state.isSLABreachColor;
    isSlaBreach = false;
    isSLABreachColor=false;
    for (let i = 0; i < repeaterLevel.items.length; i++) {
        if ((i === 0 && repeaterLevel.items[i].slaThreshold === undefined) || (i > 0 && (
                repeaterLevel.items[i].slaThreshold === undefined ||
                repeaterLevel.items[i - 1].slaThreshold === undefined ||
                repeaterLevel.items[i].slaThreshold <= repeaterLevel.items[i - 1].slaThreshold))) {
            repeaterLevel.items[i].isValid = true; // Mark invalid SLA levels
            isSlaBreach = true;
        } else {
            repeaterLevel.items[i].isValid = false; // Mark valid SLA levels
        }
    }

    slaColorLevel.items.forEach(item => item.isInvalid = false);
    for (let i = 0; i < slaColorLevel.items.length-1; i++) {
        if(slaColorLevel.items[i].slaColor.value === slaColorLevel.items[i+1].slaColor.value){
            slaColorLevel.items[i].isInvalid = true;
            slaColorLevel.items[i+1].isInvalid = true;
            isSLABreachColor = true;
        }
        if(i==0 && slaColorLevel.items.length > 2 && 
        (slaColorLevel.items[i].slaColor.value === slaColorLevel.items[i+2].slaColor.value)) {
            slaColorLevel.items[i].isInvalid = true;
            slaColorLevel.items[i+2].isInvalid = true;
            isSLABreachColor = true;
        }
    }
    api.setState('repeaterLevel', repeaterLevel);
    api.setState('isSLABreach', isSlaBreach);
    api.setState('slaColorLevel',slaColorLevel);
    api.setState('isSLABreachColor',isSLABreachColor);
    api.setState('slaImage',slaImage);
}
