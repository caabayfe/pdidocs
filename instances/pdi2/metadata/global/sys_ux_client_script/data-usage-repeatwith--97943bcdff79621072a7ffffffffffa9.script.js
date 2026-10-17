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
            id: "data-usage",
            label: helpers.translateSync("Data usage"),
            order: "10",
            route: "data-usage"
        },
        {
            id: "rule-details",
            label: helpers.translateSync("Rules"),
            order: "20",
            route: "rule-details"
        }
    ];
}
