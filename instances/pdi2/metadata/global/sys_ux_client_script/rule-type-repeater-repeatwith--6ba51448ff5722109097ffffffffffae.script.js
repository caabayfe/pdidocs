/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var ruleType = [{
            "description": helpers.translateSync("Move data from a primary table to an archive table"),
            "icon": "inbox-archive-outline",
            "id": "archive",
            "label": helpers.translateSync("Archive"),
            "valid": false
        },
        {
            "description": helpers.translateSync("Delete data from a primary table on a recurring basis"),
            "icon": "trash-outline",
            "id": "table_cleaner",
            "label": helpers.translateSync("Cleanup"),
            "valid": false
        },
        {
            "description": helpers.translateSync("Delete data from a primary table now or at a later date and time"),
            "icon": "trash-outline",
            "id": "onetime_delete",
            "label": helpers.translateSync("One-time delete"),
            "valid": false
        }
    ];
    return ruleType;
}
