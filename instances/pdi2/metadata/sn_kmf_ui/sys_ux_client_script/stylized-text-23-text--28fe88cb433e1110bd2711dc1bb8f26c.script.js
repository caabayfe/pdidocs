/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var results = api.data.cm.output.data.GlideRecord_Query.sys_kmf_crypto_module._results;

  if (0 == results.length || api.context.props.cryptoModuleId == "")
    return helpers.translateSync("Select a Cryptographic Module");

	return helpers.translateSync("Module Access Policies for {0}", results[0].name.displayValue);
}
