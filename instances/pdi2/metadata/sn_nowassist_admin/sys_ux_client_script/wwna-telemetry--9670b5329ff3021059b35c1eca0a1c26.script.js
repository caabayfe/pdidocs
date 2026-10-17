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

    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch (event?.name) {
        case "NOW_TEXT_LINK#CLICKED":
            let text = "";
            switch (event?.elementId) {
                case "wwna_get_started_text_link":
                    text = "Now Assist context menu: Get started";
                    break;
                case "community_forum_text_link":
                    text = "Community forum";
                    break;
            }
            trackUsage("Clicked Helpful Resources", {
                name: text
            });
            break;
        case "NOW_ACCORDION_ITEM#EXPANDED_SET":
            let faq = "";
            switch (event?.elementId) {
                case "wwna_improve_writing_faq":
                    faq = api?.state?.accordionItem1Header?.label;
                    break;
                case "wwna_get_started_faq":
                    faq = api?.state?.accordionItem2Header?.label;
                    break;
                case "changes_suggested_text_faq":
                    faq = api?.state?.accordionItem3Header?.label;
                    break;
                case "feedback_suggestions_faq":
                    faq = api?.state?.accordionItem4Header?.label;
                    break;
            }
            trackUsage("Opened FAQ", {
                name: faq
            });
            break;
        case "UXF_TAB_SET#TAB_SELECTED":
            switch (event.payload?.selectedTabLabel) {
                case "Configurations":
                    trackUsage("Clicked Configurations tab", {
                        card : "WWNA",
                        payload: api.state?.configurationRowDefinitions?.rows
                    });
                    break;
                case "Available":
                    trackUsage("Clicked Available tab", {
                        card : "WWNA",
                        payload: api.state?.availableRowDefinitions?.rows
                    });
                    break;
                case "Active":
                    trackUsage("Clicked Active tab", {
                        card : "WWNA",
                        payload: api.state?.isEnabledRowDefinitions?.rows
                    });
                    break;
            }
            break;
        case "NOW_LIST#CUSTOM_COMPONENT_ACTION_DISPATCHED":
            if (event.payload?.detail?.type === "NOW_DROPDOWN#ITEM_CLICKED") {
                var selectedRow = event.payload?.cellContext?.row;
                var selectedAction = selectedRow?.cells;
                var actionId = event.payload?.detail?.payload?.item?.id;
                switch (actionId) {
                    case "activate_configuration":
                    case "activate_skill":
                        trackUsage(actionId == "activate_skill" ? "Activate Skill" : "Activate Configuration", {
                            card : "WWNA",
                            workflow : selectedAction?.workflow?.value,
                            product : selectedAction?.product?.value,
                            skill : selectedAction?.skill?.value
                        });
                        api.emit('NAV_ITEM_SELECTED', {
                            external: {
                                url: `now/now-assist-admin/skill-guided-setup/${event.payload?.cellContext?.row?.key}`,
                                target: '_blank'
                            }
                        });
                        break;
                    case "deactivate_configuration":
                    case "deactivate_skill":
                        api.setState('deactivateSkillConfigId', event.payload?.cellContext?.row?.key);
                        trackUsage(actionId == "deactivate_skill" ? "Deactivate Skill" : "Deactivate Configuration", {
                            card : "WWNA",
                            payload: event.payload?.cellContext?.row?.key
                        });
                        const keyConfig = actionId == "deactivate_skill" ? "availableTabConfig" : "configurationTabConfig";
                        api.setState("deactivateClickedTab", keyConfig);
                        helpers.modal.open('deactivate_configuration');
                        break;
                    case "edit_configuration":
                    case "manage_skill":
                        trackUsage(actionId == "manage_skill" ? "Manage Skill" : "Edit Configuration", {
                            card : "WWNA",
                            workflow : selectedAction?.workflow?.value,
                            product : selectedAction?.product?.value,
                            skill : selectedAction?.skill?.value
                        });
                        api.emit('NAV_ITEM_SELECTED', {
                            external: {
                                url: `now/now-assist-admin/skill-guided-setup/${event.payload?.cellContext?.row?.key}`,
                                target: '_blank'
                            }
                        });
                        break;
                    case "migrate_configuration":
                        if(selectedRow.key){
                            api.setState('migrateSkillConfigId', selectedRow.key);
                            helpers.modal.open('migrate_existing_config_modal');
                        }
                        break;
                }
            }
            break;
    }
}
