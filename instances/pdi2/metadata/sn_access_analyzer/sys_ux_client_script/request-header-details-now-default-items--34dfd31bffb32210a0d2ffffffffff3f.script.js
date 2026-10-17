/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const userData = [];
    var value;
    var analyzedBy = api?.data?.get_request_details?.result?.analyze_by.value;

    // Create entries for if it is run for: User, Group or Role
    if (analyzedBy == "User") {
        value = {
            "type": "text-link",
            "label": api?.data?.get_request_details?.result?.user?.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user.do?sys_id=" + api?.data?.get_request_details?.result?.user.value,
            "underlined": false,
            "opensWindow": true
        };
        userData.push({
            "label": helpers.translateSync("User"),
            "value": value
        });
    }

    if (analyzedBy == "Group") {
        value = {
            "type": "text-link",
            "label": api.data.get_request_details.result.group.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_group.do?sys_id=" + api.data.get_request_details.result.group.value,
            "underlined": false,
            "opensWindow": true
        };
        userData.push({
            "label": helpers.translateSync("Group"),
            "value": value
        });
    }
    if (analyzedBy == "Role") {
        value = {
            "type": "text-link",
            "label": api.data.get_request_details.result.role.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_role.do?sys_id=" + api.data.get_request_details.result.role.value,
            "underlined": false,
            "opensWindow": true
        };
        userData.push({
            "label": helpers.translateSync("Role"),
            "value": value
        });

    }

    /**
     * Create and push consumer's config, if it is not a traditional flow
     * Example: label: "AI Agent", value: "Name of the Agent" and so on.
     * */
    createConsumersData();

    if (api.data.get_request_details.result.last_run.displayValue) {
        userData.push({
            "label": helpers.translateSync("Last executed"),
            "value": {
                "type": "string",
                "value": api.data.get_request_details.result.last_run.displayValue
            }
        });
    }
    return userData;

    function createConsumersData() {
        const parent_type = api?.data?.get_header_data?.output?.parent_type;
        const consumersLabelsConfig = ["gen_ai_agent", "gen_ai_workflow"];
        if(consumersLabelsConfig.includes(parent_type)) {
            // Grab the parent type and name of the resource selected, comes handy for non-traditional consumers 
            const parent_name = api?.data?.get_header_data?.output?.parent_name;
            const parent_sys_id = api?.data?.get_header_data?.output?.parent_sys_id;
            const linkConfig = {
                "type": "text-link",
                "label": parent_name,
                "variant": "primary",
                "showIcon": true,
                "icon": "open-link-right-outline",
                "underlined": false,
                "opensWindow": true
            }
            let payload = {};
            switch(parent_type) {
                case "gen_ai_agent":
                    payload = {
                        "label": helpers.translateSync("AI Agent"),
                        "value" : {
                            "href": "nav_to.do?uri=sn_aia_agent.do?sys_id=" + parent_sys_id,
                            ...linkConfig
                        }
                    };
                    userData.push(payload);
                    break;
                case "gen_ai_workflow":
                    payload = {
                        "label": helpers.translateSync("Agentic Workflow"),
                        "value" : {
                            "href": "nav_to.do?uri=sn_aia_usecase.do?sys_id=" + parent_sys_id,
                            ...linkConfig
                        }
                    }
                    userData.push(payload);
                    break;
                default:
                    return null;
            }
        }
    }
}
