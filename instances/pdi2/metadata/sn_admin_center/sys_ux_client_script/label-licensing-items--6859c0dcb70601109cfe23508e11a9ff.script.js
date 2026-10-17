/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{"label":"Licensing","value":{"type":"highlighted-value","label":`${api.context.props.licensing}`,color: api.context.props.licensing === 'All Included' ? 'positive' : 'critical',
            status: api.context.props.licensing === 'All Included' ? 'positive' : 'critical',
            showIcon: false}}];
}
