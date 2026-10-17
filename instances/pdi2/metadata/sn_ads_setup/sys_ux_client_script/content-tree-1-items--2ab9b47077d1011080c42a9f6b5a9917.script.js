/**
  * @param {params} params
  * @param {api} params.api
  * @param {any} params.imports
  */
function evaluateProperty({api}) {
  
  if (api.state.taskList) {
    let tasks = api.state.taskList;
    tasks = tasks.map(item => ({"label": item.task_type === 'basic' ? item.name + '*' : item.name, 
      "id": item.sys_id, 
      "icon": item.isLocked ? 'lock-outline' : (item.interactionStatus === 'Completed' ? 'check-fill' : '  '),
      "status": item.interactionStatus
    }));
    return tasks;
  }
  
  return [];
}
