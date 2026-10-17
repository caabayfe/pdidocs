/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var columnDef = {
        "columns": [{
                "key": "name",
                "label": "Name",
                "opensInNew": true,
                "type": "link"
            },
            {
                "key": "product",
                "label": helpers.translateSync("Product"),
                "type": "string"
            },
            {
                "componentTag": "now-highlighted-value",
                "defaultComponentProps": {
                    "showIcon": true
                },
                "key": "priority",
                "label": "Priority",
                "placeholderDimensions": {
                    "height": "100px",
                    "width": "100px"
                },
                "type": "custom"
            },
            {
                "key": "status",
                "label": "Status",
                "type": "string"
            },
            {
                "key": "test",
                "label": helpers.translateSync("Test linked"),
                "opensInNew": true,
                "type": "link"
            },
            {
                "key": "disposition",
                "label": helpers.translateSync("Predicted disposition"),
                "type": "string"
            },
            {
                "key": "plugin",
                "label": helpers.translateSync("Plugin"),
                "type": "string"
            }
        ]
    };

    // remove test linked column in case of production
    if (api.context.props.experienceProperties?.environment?.value?.toLowerCase?.() === 'production') {
        columnDef.columns.splice(4, 1);
    }
    return columnDef;
}
