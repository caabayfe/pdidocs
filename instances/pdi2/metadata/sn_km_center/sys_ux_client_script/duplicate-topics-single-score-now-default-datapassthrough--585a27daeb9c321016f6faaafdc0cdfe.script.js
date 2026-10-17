/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const output = api.data.duplicate_topics_timeseries_input.output;
  const topics = output ? output.at(-1).value : null;
  return [{
    "data": [{
      "value": topics
    }],
    "metadata": {}
  }];
}
