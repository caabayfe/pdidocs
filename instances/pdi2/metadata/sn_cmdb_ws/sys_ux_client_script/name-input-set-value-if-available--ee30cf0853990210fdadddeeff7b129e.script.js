/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function script({api}) {
  const policyName = api?.data?.policyData?.general_info?.policy_name;
  if (!policyName)
    return;
	return policyName;
}
