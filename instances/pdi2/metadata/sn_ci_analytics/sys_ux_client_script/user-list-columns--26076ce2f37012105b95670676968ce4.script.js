/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  // User Id or Hashed User Id shown on the basis of condition
  const userColumn = api.data.show_hashed_user_id_1.output == "true" ? 'user.user_id.hashed_user_id' : 'user.user_id.user_name';
  const columns = `${userColumn},is_anonymous,channels,last_conversation`;
  return columns;
	
}
