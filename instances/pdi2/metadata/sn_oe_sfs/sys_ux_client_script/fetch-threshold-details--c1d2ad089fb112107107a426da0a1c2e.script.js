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
    var countLabelMap = api.state.countLabelMap;
    var temp1 = false;
    var thresholdLevels = [];
    var firstThreshold, secondThreshold;
    const repeaterLevel = api.state.repeaterLevel;
    let slaColorLevel = {...api.state.slaColorLevel};
    const slaImage = api.state.slaImage;
    let tempLevelCount;
    repeaterLevel.items.splice(1);
    slaImage.items.splice(1);
    slaColorLevel.items =[];
    slaColorLevel.items.push({
        heading: `Threshold Tab Level 1`,
        isInvalid: false,
        slaColor: {
            "type": "id",
            "value": "warning"
        },
    });
    if (api.data.fetch_information_session_workspace_settings_1.output.data && api.data.fetch_information_session_workspace_settings_1.output.data.GlideRecord_Query.information_session_tab_workspace_setting._results && api.data.fetch_information_session_workspace_settings_1.output.data.GlideRecord_Query.information_session_tab_workspace_setting._results.length > 0) {
        let result = api.data.fetch_information_session_workspace_settings_1.output.data.GlideRecord_Query.information_session_tab_workspace_setting._results[0];
        firstThreshold = result.first_color_threshold.value;
        secondThreshold = result.second_color_threshold.value;
        temp1 = api.data.fetch_information_session_workspace_settings_1.output.data.GlideRecord_Query.information_session_tab_workspace_setting._results[0].is_active.value;
        thresholdLevels = JSON.parse(result.u_threshold_levels.value);
    }
    api.setState('isSessionTabEnabled', temp1);
    if (api.state.workSpaceId !== null) {
        if (thresholdLevels && thresholdLevels.length > 0) {
            tempLevelCount = thresholdLevels.length;
            const severityLevels = ["critical", "severe"];
            thresholdLevels.forEach((levelObj, index) => {
                let key = Object.keys(levelObj)[0]; // Extract key dynamically (e.g., "level_1", "level_2")
                let levelData = levelObj[key]; // Get SLATimer and color
                if (index == 0) {
                    repeaterLevel.items[0].slaThreshold = levelData.SLATimer;
                    slaImage.items[0].imageSource = `${levelData.color}_light_theme_tab.png`;
                    slaColorLevel.items[0].slaColor.value = levelData.color;
                } else {
                    const newRepeater = {
                        buttonLabel: "Remove Level",
                        heading: `Timer for SLA breach warning (Level ${index + 1})`,
                        typeaheadLabel: `Set timer to show a ${severityLevels[index - 1]} SLA breach (tab turns color) when the agent switches away from the current tab`,
                        buttonVariant: "tertiary",
                        slaThreshold: levelData.SLATimer, // Use saved SLA threshold
                        isValid: false, // Assuming saved SLAs are valid
                    };
                    repeaterLevel.items.push(newRepeater);
                    const newColorLevel = {
                        heading: `Threshold Tab Level ${index+1}`,
                        isInvalid: false,
                        slaColor: {
                            "type": "id",
                            "value": levelData.color
                        },
                    };
                    slaColorLevel.items.push(newColorLevel);
                    slaImage.items.push({
                        imageSource: `${levelData.color}_light_theme_tab.png`,
                    });
                }

            });
        } else if (firstThreshold) {
            repeaterLevel.items[0].slaThreshold = firstThreshold;
            slaColorLevel.items[0].slaColor.value = `warning`;
            slaImage.items[0].imageSource = `warning_light_theme_tab.png`;
            tempLevelCount = 1;
            if (secondThreshold) {
                const newRepeater = {
                    buttonLabel: "Remove Level",
                    heading: `Timer for SLA breach warning (Level 2)`,
                    typeaheadLabel: `Set timer to show a severe SLA breach (tab turns color) when the agent switches away from the current tab`,
                    buttonVariant: "tertiary",
                    slaThreshold: secondThreshold, // Use saved SLA threshold
                    isValid: false, // Assuming saved SLAs are valid
                };
                const newColorLevel = {
                    heading: `Threshold Tab Level 2`,
                    isInvalid: false,
                    slaColor: {
                        "type": "id",
                        "value": "critical"
                    },
                };
                repeaterLevel.items.push(newRepeater);
                slaColorLevel.items.push(newColorLevel);
                slaImage.items.push({
                    imageSource: `critical_light_theme_tab.png`,
                });
                tempLevelCount = 2;
            }
        } else {
            repeaterLevel.items[0].slaThreshold = 30;
            slaColorLevel.items[0].slaColor.value = `warning`;
            slaImage.items[0].imageSource = `warning_light_theme_tab.png`;
            tempLevelCount = 1;
        }

    } else {
        repeaterLevel.items[0].slaThreshold = 30;
        slaColorLevel.items[0].slaColor.value = `warning`;
        slaImage.items[0].imageSource = `warning_light_theme_tab.png`;
        tempLevelCount = 1;
    }
    api.setState('countLevel', tempLevelCount);
    api.setState('repeaterLevel', repeaterLevel);
    api.setState('slaColorLevel', slaColorLevel);
    api.setState('slaImage', slaImage);
    api.setState('displayToggle',true);

    if (temp1) {
        helpers.timing.setTimeout(() => {
            helpers.focus('card_base_container_2');
        }, 0);
    } else {
        helpers.timing.setTimeout(() => {
            helpers.focus('toggle_1');
        }, 0);
    }

}
