/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const projectName = api.state?.projectData?.name?.value;
    return [{
        "label": helpers.translateSync("Name"),
        "value": {
            "type": "string",
            "value": projectName
        }
    }];
}
