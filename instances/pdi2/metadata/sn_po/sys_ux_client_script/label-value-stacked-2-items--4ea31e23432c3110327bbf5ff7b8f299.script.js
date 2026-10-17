/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const createdBy = api.state?.projectData?.createdBy;
    if(createdBy){
    return [{
        "label": helpers.translateSync("Created by"),
        "value": {
            "type": "string",
            "value": createdBy
        }
    }];
}
}
