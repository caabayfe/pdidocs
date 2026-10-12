/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.imports
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.id !== '-1') {
        if (
            api.data.get_setup_info.items &&
            api.data.get_setup_info.items.length !== 0 &&
            api.data.get_process_detail.result &&
            api.data.get_process_detail.result.label
        ) {
            return api.data.get_process_detail.result.label.displayValue;
        } else {
            return '';
        }
    }
    return helpers.translateSync('New Guided Setup');
}
