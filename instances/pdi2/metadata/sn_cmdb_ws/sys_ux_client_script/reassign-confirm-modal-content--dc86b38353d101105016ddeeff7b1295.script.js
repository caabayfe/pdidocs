/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const currentUser = api.context.session.user.sys_id;
  if (api.data.task_detail_record 
      && api.data.task_detail_record.result
      && api.data.task_detail_record.result.assigned_to
      && api.data.task_detail_record.result.assigned_to.value
      && api.data.task_detail_record.result.assigned_to.displayValue) {
        if(api.data.task_detail_record.result.assigned_to.value != currentUser) 
	        return helpers.translateSync('{0} is currently reviewing these records. Are you sure you want to reassign this task?', api.data.task_detail_record.result.assigned_to.displayValue);
        else { //current user is reassigning
          if(api.state.reassignmentData && api.state.reassignmentData.assignee == '' && api.state.reassignmentData.assignmentGroup == '') { //back to admin
            return helpers.translateSync('Are you sure you want to reassign this task back to admin?');
          } else {
            return helpers.translateSync('Are you sure you want to reassign this task?');
          }
          
        }
      } 
  else
    return '';
}
