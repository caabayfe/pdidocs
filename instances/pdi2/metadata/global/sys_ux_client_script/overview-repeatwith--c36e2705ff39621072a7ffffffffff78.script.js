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
                id: "overview",
                label: helpers.translateSync("Overview"),
                order: "10",
                route: "overview"
            },
            {
                id: "tables",
                label: helpers.translateSync("Tables"),
                order: "20",
                route: "tables"
            }
        ];
}
