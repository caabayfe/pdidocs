/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var cisProcessedViaIre = 0;
  if(api.data.cis_processed_via_ire_agg && api.data.cis_processed_via_ire_agg.output
     && api.data.cis_processed_via_ire_agg.output.data && api.data.cis_processed_via_ire_agg.output.data.GlideAggregate_Query) {
       cisProcessedViaIre = parseInt(api.data.cis_processed_via_ire_agg.output.data.GlideAggregate_Query[0].sum);
     }
	return !(cisProcessedViaIre > 0);
}
