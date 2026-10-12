/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var currentUser = api.context.session.user;
  var { roles } = currentUser;
  if (roles.includes("admin") || roles.includes("sn_sow_srm.srm_admin"))
    return false;
  
  var { form } = api.data.record;
  if (form.fields.manager.value) {
    return form.fields.manager.value !== currentUser.sys_id;
  }
 	
  return true;
}
