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
            "label": "Updated on",
            "value": {
                "type": "string",
                "value": api.context.props.payload.updatedOn,
            }
        },
        {
            "label": "Updated by",
            "value": {
                "type": "string",
                "value": api.context.props.payload.updatedBy
            }
        },
        {
            "label": "Routing",
            "value": {
                "type": "string",
                "value": api.context.props.payload.payload.routing
            }
        },
        {
            "label": "Fallback Exception",
            "value": {
                "type": "string",
                "value": api.context.props.payload.payload.fallback.toString() === "true" ? "Yes" : "No",
            }
        }
    ];
}
