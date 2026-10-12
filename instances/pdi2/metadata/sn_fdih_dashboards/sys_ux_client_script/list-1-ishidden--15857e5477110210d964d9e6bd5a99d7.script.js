/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let user_roles = api.context.session.user.roles;
  //Displaying the Flow Jobs Waiting To Run widget only for admin roles
  let visibility_condition 
      = user_roles.includes("admin");
  return !visibility_condition;
}
