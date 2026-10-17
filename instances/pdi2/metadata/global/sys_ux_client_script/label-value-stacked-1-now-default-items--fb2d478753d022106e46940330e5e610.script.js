/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const fieldValue = api.data.record_3.form.fields.name.originalValue;
    const label = helpers.translateSync("Table Name");
    const result = [{
        "value": [{
                "type": "string",
                "value": label
            },
            {
                "type": "string",
                "value": fieldValue
            }
        ]
    }];

    return JSON.stringify(result);
    
}
