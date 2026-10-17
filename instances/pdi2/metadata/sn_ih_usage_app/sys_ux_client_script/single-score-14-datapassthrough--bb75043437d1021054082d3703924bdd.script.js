/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */

// API Sum (value)
function evaluateProperty({api, helpers}) {
    var egg_count = api.data.data_egress_count_by_source.output.data.GlideAggregate_Query;
    if (!egg_count) {
      egg_count = api.data.data_egress_by_source_script_1.output.dataEgressBySource;
    }
    var source_type_api = ['APIJSONV2', 'APIREST', 'APISOAP'];
    var api_sum = 0;
    for (let i = 0; i < egg_count.length; i++) {
      if (egg_count[i] && egg_count[i].groupBy && egg_count[i].groupBy[0] && egg_count[i].groupBy[0].value && source_type_api.indexOf(egg_count[i].groupBy[0].value) > -1) {
        api_sum = api_sum + parseInt(egg_count[i].sum);
      }
    }
  while(api_sum > 999) {
    api_sum = api_sum / 1000;
  }
  return [{"data":[{"value":api_sum,"change":"0","changePercent":"0"}], "metadata":{ "format": { "unitFormat": "{0}", "frequency": "daily", "precision": 2 },},"sparkline":{}}];
}
