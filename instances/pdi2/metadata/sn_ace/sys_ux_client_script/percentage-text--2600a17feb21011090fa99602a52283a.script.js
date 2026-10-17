/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const { tasks } = api.state;
  let total = 0;
  let completed = 0;
  Object.entries(tasks).forEach(([task, status]) => {
    total += status.weight;
    if (status.completed) 
      completed += status.weight;
  });

	return completed/total ? (`${Math.round((completed/total)*100)} %`) : '0% ';
}
