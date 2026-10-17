/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    const fieldLabels = api.state.field_labels || {};

    const result = [
        {
            label: fieldLabels.refined_code,
            value: {
                type: 'string',
                value: api.item.value.error_code.displayValue
            }
        },
        {
            label: fieldLabels.occurrences,
            value: {
                href: 'javascript:void(0)',
                type: 'text-link',
                label: api.item.value.error_count.displayValue,
                underlined: true
            }
        },
        {
            label: fieldLabels.category,
            value: {
                type: 'string',
                value: api.item.value.error_category.displayValue
            }
        },
        {
            label: fieldLabels.domain,
            value: {
                type: 'string',
                value: api.item.value.sys_domain.displayValue
            }
        }
    ];

    return result;
}
