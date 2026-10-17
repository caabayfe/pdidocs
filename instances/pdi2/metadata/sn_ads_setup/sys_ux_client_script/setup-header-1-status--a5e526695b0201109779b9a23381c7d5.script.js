/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    let status = api.context.props.id != -1 ? (api.data.get_setup_info.result ? api.data.get_setup_info.result.status.displayValue : '') : helpers.translateSync('Draft');
    return {
        color: 'low',
        label: status,
        variant: 'tertiary'
    };
}
