/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const currentUser = api.context.session.user.sys_id;
  const taskData = api?.data?.certCtrl?.taskData;
  if (taskData
      && taskData.assignedTo
      && taskData.assignedTo.value
      && taskData.assignedTo.displayValue) {
        if(taskData.assignedTo.value != currentUser)
	        return helpers.translateSync('{0} is currently certifying these records. Are you sure you want to reassign this task?', taskData.assignedTo.displayValue);
        else { //current user is reassigning
          if(api.state.reassignmentData && api.state.reassignmentData.assignee == '' && api.state.reassignmentData.assignmentGroup == '') { //back to admin
            return helpers.translateSync('Are you sure you want to send this task for reassignment?');
          } else {
            return helpers.translateSync('Are you sure you want to reassign this task?');
          }
          
        }
      } 
  else
    return '';
}
