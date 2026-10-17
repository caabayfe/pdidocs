/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var configsData = api.data.sc_get_suites_with_results_1.output || [];
  let map = [];
  /* Skip returning the Instance hardening settings' suite using its sysId */
  for ( const record of configsData ) {
    if ( record.id!=="532840af20a70110fa9b96e15935cc77" ) {
      map.push({
        id: record.id,
        label: record.label
      });
    }
  }
  return map;
}
