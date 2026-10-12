/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [
        {
            label: 'Templates',
            value: {type: 'string', value: api.state.readyTemplatesCount}
        },
        {
            label: 'Associated deduplication tasks',
            value: {
                type: 'string',
                value: api.state.templateTasksCount
            }
        }
    ];
}
