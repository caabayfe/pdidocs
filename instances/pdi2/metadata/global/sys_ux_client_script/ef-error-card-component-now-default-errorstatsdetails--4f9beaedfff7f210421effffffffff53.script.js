/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const fieldLabels = api.context.props.fieldLabels || {};

    const result = [
        {
            label: helpers.translateSync(
                fieldLabels.refined_code || 'Refined Code'
            ),
            value: {
                type: 'string',
                value: api.item.value.error_code.displayValue
            }
        },
        {
            label: helpers.translateSync(
                fieldLabels.occurrences || 'Occurrences'
            ),
            value: {
                href: 'javascript:void(0)',
                type: 'text-link',
                label: api.item.value.error_count,
                underlined: true
            }
        },
        {
            label: helpers.translateSync(
                fieldLabels.error_category || 'Error Category'
            ),
            value: {
                type: 'string',
                value: api.item.value.error_category.displayValue
            }
        }
    ];

    return result;
}
