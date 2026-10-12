/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var hideComponent = false;
  var productBreakdownRows = api.data.fetch_wdf_detailed_product_metrics.output.rows.length || 0;

  if (productBreakdownRows > 0) {
    hideComponent = true;
  }
  
	return hideComponent;
}
