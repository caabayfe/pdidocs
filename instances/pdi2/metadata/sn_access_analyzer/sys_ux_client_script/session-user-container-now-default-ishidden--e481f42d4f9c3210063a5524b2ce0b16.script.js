/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const session_user = api?.data?.get_header_data?.output?.session_user;
  // If there exists a session user, render the UI else hide it
  return session_user? false: true;
}
