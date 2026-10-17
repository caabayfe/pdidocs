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
    var analyzedBy = api.data.request_resource.result.analyze_by.value;
    if (analyzedBy == "User") {
        value = {
            "type": "text-link",
            "label": api.data.request_resource.result.user.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user.do?sys_id=" + api.data.request_resource.result.user.value,
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
            "label": api.data.request_resource.result.group.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_group.do?sys_id=" + api.data.request_resource.result.group.value,
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
            "label": api.data.request_resource.result.role.displayValue,
            "variant": "primary",
            "showIcon": true,
            "icon": "open-link-right-outline",
            "href": "nav_to.do?uri=sys_user_role.do?sys_id=" + api.data.request_resource.result.role.value,
            "underlined": false,
            "opensWindow": true
        };
        userData.push({
            "label": helpers.translateSync("Role"),
            "value": value
        });

    }

    var resourceType = api.data.request_resource.result.resource_type.value;
    if(resourceType === 'record') {
        var targetTable = api.data.request_resource.result.target_table.displayValue;
        if (targetTable) {
            userData.push({
                "label": helpers.translateSync("Table"),
                "value": {
                    "type": "string",
                    "value": targetTable
                }
            });
        }

        var targetRecord = api.data.request_resource.result.target_record.displayValue;
        if (targetRecord) {
            // targetRecord is a document id field and is of format Incident: INC0000004
            // Extract only the record value for display
            var targetRecordDisplay = targetRecord.replace(/(.*):\s*/, "");
            userData.push({
                "label": helpers.translateSync("Record"),
                "value": {
                    "type": "string",
                    "value": targetRecordDisplay
                }
            });
        }
        
        var targetField = api.data.request_resource.result.target_field.displayValue;
        if (targetField) {
            userData.push({
                "label": helpers.translateSync("Field"),
                "value": {
                    "type": "string",
                    "value": targetField
                }
            });
        }
    } else if(resourceType === 'ui_page') {
        var targetUIPage = api.data.request_resource.result.target_ui_page.displayValue;
        if (targetUIPage) {
            userData.push({
                "label": helpers.translateSync("UI Page"),
                "value": {
                    "type": "string",
                    "value": targetUIPage
                }
            });
        }
    } else if(resourceType === 'client_callable_script_include') {
        var targetScript = api.data.request_resource.result.target_client_callable_script_include.value;
        if (targetScript) {
            userData.push({
                "label": helpers.translateSync("Client Callable Script include"),
                "value": {
                    "type": "string",
                    "value": targetScript
                }
            });
        }
    } else if(resourceType === 'rest_endpoint') {
        var targetRestEndpoint = api.data.request_resource.result.target_rest_endpoint.displayValue;
        if (targetRestEndpoint) {
            userData.push({
                "label": helpers.translateSync("REST Endpoint"),
                "value": {
                    "type": "string",
                    "value": targetRestEndpoint
                }
            });
        }

        var targetRestMethod = api.data.request_resource.result.target_rest_endpoint_method.displayValue;
        if (targetRestMethod) {
            userData.push({
                "label": helpers.translateSync("Method"),
                "value": {
                    "type": "string",
                    "value": targetRestMethod.toUpperCase()
                }
            });
        }
    }
    if (api.data.request_resource.result.last_run.displayValue) {
      userData.push({
          "label": helpers.translateSync("Last executed"),
          "value": {
              "type": "string",
              "value": api.data.request_resource.result.last_run.displayValue
          }
      });
    }
    return userData;
}
