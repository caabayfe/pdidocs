/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({ api, helpers }) {

	if (api.context.props.payload && api.context.props.payload.subtitle) {
		return api.context.props.payload.subtitle;
	}

	return '';
}
