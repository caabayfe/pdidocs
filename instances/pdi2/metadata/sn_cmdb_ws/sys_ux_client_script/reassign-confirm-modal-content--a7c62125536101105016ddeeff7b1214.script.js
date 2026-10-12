/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const currentUser = api.context.session.user.sys_id;
  const form = api.data.record.form;
  const formField = form ? form.fields : null;
  if (formField
      && formField.assigned_to
      && formField.assigned_to.value
      && formField.assigned_to.displayValue) {
        if(formField.assigned_to.value != currentUser)
	        return helpers.translateSync('{0} is currently attesting these CIs. Are you sure you want to reassign this task?', formField.assigned_to.displayValue);
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
