/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const output = [{
            "icon": "window-dialog-outline",
            "id": "experience",
            "label": helpers.translateSync("Experience")
        },
        {
            "icon": "component-outline",
            "id": "component",
            "label": helpers.translateSync("Component")
        },
        {
            "icon": "documents-outline",
            "id": "page_collection",
            "label": helpers.translateSync("Page collection")
        },
        {
            "icon": "database-outline",
            "id": "controller",
            "label": helpers.translateSync("Controller")
        },
        {
            "icon": "magic-outline",
            "id": "preset",
            "label": helpers.translateSync("Preset")
        }
    ];

    return output;
}
