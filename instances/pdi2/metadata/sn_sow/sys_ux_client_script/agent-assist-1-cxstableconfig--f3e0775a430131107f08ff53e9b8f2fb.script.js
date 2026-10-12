/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  const table = api.context.props.table.includes('kb_template_') ?
    'kb_template' :
    api.context.props.table;

	return api.context.props.cxsTableConfig[table];
}
