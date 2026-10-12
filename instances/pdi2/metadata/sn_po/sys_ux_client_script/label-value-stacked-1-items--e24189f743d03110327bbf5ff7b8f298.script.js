/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const projectNumber = api.state?.projectData?.projectNumber;
    if(projectNumber){
    return [{
        "label": helpers.translateSync("Number"),
        "value": {
            "type": "string",
            "value": projectNumber
        }
    }];
    }
}
