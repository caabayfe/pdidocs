/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var metaData = [{
            label: helpers.translateSync('State'),
            value: {
                type: 'string',
                value: api.item.value.state
            }
        },
        {
            label: helpers.translateSync('Plan'),
            value: api.item.value.comm_plan
        }
    ];

    if (api.item.value.due_in.due_date) {
        metaData.push({
            label: api.item.value.is_overdue ? helpers.translateSync('Overdue by') : helpers.translateSync('Due in'),
            value: {
                type: 'highlighted-value',
                label: api.item.value.due_in.display_value,
                color: api.item.value.is_overdue ? 'critical' : 'positive',
                showIcon: true,
                icon: 'clock-outline'
            }
        });
    }
    return metaData;
}
