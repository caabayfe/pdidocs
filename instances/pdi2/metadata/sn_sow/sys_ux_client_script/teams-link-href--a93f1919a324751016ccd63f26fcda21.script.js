/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  let teamsLink = "https://teams.microsoft.com/l/chat/0/0?users=";
  teamsLink += api.state.email;

	return teamsLink;
}
