/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var firstDate = api.state.firstDate;
    var lastDate = api.state.lastDate;
    return [{
            before: firstDate
        },
        {
            after: lastDate
        }
    ];
}
