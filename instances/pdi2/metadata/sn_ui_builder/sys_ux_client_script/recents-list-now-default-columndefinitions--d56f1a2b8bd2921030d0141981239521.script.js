/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "columns": [{
                "cellEditingDisabled": true,
                "key": "favorites",
                "label": "",
                "width": "70px",
                "renderAsLink": false,
                "type": "custom",
                "componentTag": "now-button-iconic",
            },
            {
                "cellEditingDisabled": true,
                "key": "label",
                "label": helpers.translateSync("Name"),
                "metadata": {
                    "internalType": "string",
                    "isSortable": true
                },
                "renderAsLink": true,
                "type": "string"
            },
            {
                "cellEditingDisabled": true,
                "disabled": true,
                "key": "className",
                "label": helpers.translateSync("Type"),
                "metadata": {
                    "internalType": "string",
                    "isSortable": true
                },
                "type": "string"
            },
            {
                "cellEditingDisabled": true,
                "disabled": true,
                "key": "scope",
                "label": helpers.translateSync("Application"),
                "metadata": {
                    "internalType": "string",
                    "isSortable": true
                },
                "type": "string"
            },
            {
                "cellEditingDisabled": true,
                "dateTimeFormat": "yyyy-MM-dd HH:mm:ss",
                "disabled": true,
                "icons": {
                    "endIcons": [{
                        "value": "caret-down-fill"
                    }]
                },
                "key": "updated",
                "label": helpers.translateSync("updated_capital"),
                "metadata": {
                    "internalType": "glide_date_time",
                    "isSortable": true,
                    "isSorted": true
                },
                "type": "dateTime"
            }
        ]
    };
}
