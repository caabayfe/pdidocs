/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // The helpers.translateSync("ID{0}",'') is an impossibly cheap 
    // way to get this to return a unique string, until helpers.translateSync 
    // allows for the t({message,code}) function call to sn-translate
    return [{
        "label": helpers.translateSync("Controller"),
        "required": true,
        "tooltip": helpers.translateSync("Select the controller"),
        "type": "select"
    }, {
        "label": helpers.translateSync("Label"),
        "required": true,
        "tooltip": helpers.translateSync("Enter a label for the controller"),
        "type": "text"
    }, {
        "label": helpers.translateSync("ID{0}",''),
        "required": true,
        "tooltip": helpers.translateSync("Enter an ID for the controller"),
        "type": "text"
    }];
}
