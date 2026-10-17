/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return `* { margin: 0;display: inline-block;    background-color: #325e58; color: white;border-radius: 10px;margin-top: 0px;margin-left: 0px; padding-left: 10px; padding-right: 10px; ${api.item.index !== 0 ? "visibility: hidden;" : ""} }`;
}
