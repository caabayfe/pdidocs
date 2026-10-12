/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.context.props.channelname.toLowerCase() != 'teams' || api.data.look_up_records_teams.results.length == 0 || api.data.look_up_records.results.length == 0 || api.data.look_up_records.results[0].manifest_name.value == "" 
    || api.data.look_up_records.results[0].manifest_name.value == null;
}
