/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
            "id": "mins",
            "label": helpers.translateSync("Mins")
        },
        {
            "id": "hours",
            "label": helpers.translateSync("Hours")
        }
    ];
}
