/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `Upgrade to ${api?.state?.toVersion} from ${api?.state?.fromVersion}`;
}
