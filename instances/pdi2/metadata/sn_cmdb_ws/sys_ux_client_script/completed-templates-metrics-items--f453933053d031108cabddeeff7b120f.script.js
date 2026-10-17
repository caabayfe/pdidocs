/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [
        {
            label: helpers.translateSync('Class'),
            value: {type: 'string', value: api.item.value.template_class}
        },
        {
            label: helpers.translateSync('Total tasks'),
            value: {
                type: 'string',
                value: api.item.value.template_task_count
            }
        },
         {
            label: helpers.translateSync('Processed tasks'),
            value: {
                type: 'string',
                value: api.item.value.template_task_processed
            }
        },
         {
            label: helpers.translateSync('Errored tasks'),
            value: {type: 'string', value: api.item.value.template_task_errors}
        },
        {
            label: helpers.translateSync('Skipped tasks'),
            value: {
                type: 'string',
                value: api.item.value.template_task_skipped
            }
        },
        {
            label: helpers.translateSync('Run time'),
            value: {
                type: 'string',
                value: api.item.value.template_run_time
            }
        }
    ];
}
