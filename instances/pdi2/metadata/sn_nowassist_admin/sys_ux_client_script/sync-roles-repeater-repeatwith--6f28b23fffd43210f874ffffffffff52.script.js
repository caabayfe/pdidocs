/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var missingRoles = api.state.missingRoles;
    var result = [];
    for (let key in missingRoles) {
        if (missingRoles[key].length > 0) {
            result.push([{
                    label: helpers.translateSync("Display"),
                    value: {
                        type: "html",
                        value: "<b>"+key+"</b>"
                    }
                },
                {
                    label: helpers.translateSync("Roles"),
                    value: {
                        type: "string",
                        value: missingRoles[key].join(', ')
                    }
                }
            ]);
        }
    }
    return result;
}
