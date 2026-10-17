/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // Grab the recsource type, examples: record, ai_agent, etc.
    const resource_type = api?.data?.get_header_data?.output?.resource_type;
    // Grab the recsource name, names of AI Agents, Workflows, etc (or any future consumers)
    const resource_name = api?.data?.get_header_data?.output?.resource_name;
    // Grab the overall_access for the log record opened
    var access = api?.data?.get_header_data?.output?.overall_access_result;
    var icon;
    var color;
    if (access === 'Passed') {
        if (api.data.debug_logs_where_script_executed.results.length > 0) {
            icon = 'diamond-exclamation-outline';
            color = 'high';
        } else {
            icon = 'circle-check-outline';
            color = 'positive';
        }
    } else {
        if (api.data.debug_logs_where_script_executed.results.length > 0) {
            icon = 'diamond-exclamation-outline';
            color = 'high';
        } else {
            icon = 'ban-outline';
            color = 'critical';
        }
    }

    const userData = [];
    var value;
    var analyzedBy = api?.data?.get_request_details?.result?.analyze_by?.value;

    // Prepare the header info for User/Group/Role
    if (analyzedBy == "User") {
        value = {
            "type": "text-link",
            "label": api?.data?.get_request_details?.result?.user?.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user.do?sys_id=" + api?.data?.get_request_details?.result?.user?.value,
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
            "label": api?.data?.get_request_details?.result?.group?.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_group.do?sys_id=" + api?.data?.get_request_details?.result?.group?.value,
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
            "label": api?.data?.get_request_details?.result?.role?.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_role.do?sys_id=" + api?.data?.get_request_details?.result?.role?.value,
            "underlined": false,
            "opensWindow": true
        };
        userData.push({
            "label": helpers.translateSync("Role"),
            "value": value
        });

    }

    // Prepare the header info for overall_access
    userData.push({
        "label": helpers.translateSync("Access"),
        "value": {
            "type": "highlighted-value",
            "showIcon": true,
            "icon": icon,
            "color": color,
            "label": access
        }
    });

    // Prepare the header info for last executed timestap
    if (api?.data?.get_request_details?.result?.last_run.displayValue) {
      userData.push({
          "label": helpers.translateSync("Last executed"),
          "value": {
              "type": "string",
              "value": api?.data?.get_request_details?.result?.last_run?.displayValue
          }
      });
    }
    return userData;
}
