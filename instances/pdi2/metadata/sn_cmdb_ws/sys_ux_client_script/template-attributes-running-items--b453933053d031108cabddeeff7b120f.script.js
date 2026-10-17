/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var runState = api.item.value.template_task_run_state;
    var displayState = '';
    var highlightColor = 'gray';
    if(runState == 'draft' || runState == 'ready') {
        displayState = 'Pending';
    }else {
        displayState = 'Running';
        highlightColor = 'blue';
    }
  return [
        {
            label: helpers.translateSync('Class'),
            value: {type: 'string', value: api.item.value.template_class}
        },
        {
            label: helpers.translateSync('Total tasks'),
            value: {
                type: 'string',
                value: api.item.value.template_task_count.total
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
            label: helpers.translateSync('Start time'),
            value: {
                type: 'string',
                value: api.item.value.template_run_start_time
            }
        },
         {
            label: helpers.translateSync('State'),
            value: {
                type: 'highlighted-value',
                label: displayState,
                color: highlightColor
            }
        }
    ];
}
