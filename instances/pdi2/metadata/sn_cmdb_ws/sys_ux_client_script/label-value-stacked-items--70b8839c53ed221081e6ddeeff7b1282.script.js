/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const totalTasksLabel = helpers.translateSync('Total tasks');
  const completedTasksLabel = helpers.translateSync('Complete');
  const openTasksLabel = helpers.translateSync('Open');
  const unassignedTasksLabel = helpers.translateSync('Unassigned');
  const {totalTaskCount, completedTaskCount, openTaskCount, unassignedTaskCount} = api.item.value;
	return [
    {
        "label": totalTasksLabel,
        "value": {
            "type": "string",
            "value": totalTaskCount || 0
        }
    },
    {
        "label": completedTasksLabel,
        "value": {
            "type": "string",
            "value": completedTaskCount || 0
        }
    },
    {
        "label": openTasksLabel,
        "value": {
            "type": "string",
            "value": openTaskCount || 0
        }
    },
    {
        "label": unassignedTasksLabel,
        "value": {
            "type": "string",
            "value": unassignedTaskCount || 0
        }
    }
];
}
