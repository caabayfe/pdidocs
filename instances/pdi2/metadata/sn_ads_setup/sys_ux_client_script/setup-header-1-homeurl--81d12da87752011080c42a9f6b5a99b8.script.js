/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const timeStamp = new Date().getTime();
	return `/now/build/adoptionservices/setup-detail/${api.context.props.setupId}/params/custom-id/${timeStamp}`;
}
