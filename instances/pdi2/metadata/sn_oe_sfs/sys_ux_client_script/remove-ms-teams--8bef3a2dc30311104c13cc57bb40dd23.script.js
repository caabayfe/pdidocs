/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var parameters = [];
    parameters.push({
        field: "",
        value: "",
        name: "sys_cs_collab_provider_id",
        sysId: api.state.teamsProviderId
    });

    parameters.push({
        field: "",
        value: "",
        name: "sys_cs_collab_provider_application_id",
        sysId: api.state.teamsProviderAppId
    });
    
    api.data.sidebar_deleteteamsconfiguration.execute({
        parameters: parameters
    });
    var channelTeams = "a812eaf8c32111100f24c87af040dd59";
    helpers.snHttp('/api/sn_oe_sfs/sidebar_teams_permission_api/util', {
            method: 'POST',
            body: {
                operation: 'DELETE_CONFIG',
                channel: channelTeams,
            }
        }).then(response => {
        }).catch(response => {
            try {
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
}
