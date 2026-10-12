/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var value = api?.data?.policy_details_form?.form?.fields?.configured?.value;
	return !value || value === "not_configured";
}
