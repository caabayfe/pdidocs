/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const prod = helpers.translateSync('Data sharing is restricted on one or more production instances. Enable data sharing for an instance by updating the trust configuration in the sn_mif_trust_config table on that instance.');
  const subProd = helpers.translateSync('Only data from the current instance is displayed in the subproduction view.');
  let res;
  if(api.state.isProd) {
    res = prod;
  }
  if(api.state.isSubProd) {
    res = subProd;
  }
  return res;
}
