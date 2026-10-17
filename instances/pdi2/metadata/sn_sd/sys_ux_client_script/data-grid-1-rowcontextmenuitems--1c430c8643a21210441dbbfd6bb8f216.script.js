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
            "actionName": "#ACTIVATE_INDICATOR",
            "criteria": "active.value=false",
            "label": helpers.translateSync("Opt in"),
            "name": "optIn"
        },
        {
            "actionName": "#ACTIVATE_INDICATOR",
            "criteria": "active.value=true",
            "label": helpers.translateSync("Opt out"),
            "name": "optOut"
        },
        {
            "actionName": "#OPEN_MODAL",
            "criteria": "top_lvl=true",
            "label": helpers.translateSync("Modify"),
            "name": "modify"
        }
    ];
}
