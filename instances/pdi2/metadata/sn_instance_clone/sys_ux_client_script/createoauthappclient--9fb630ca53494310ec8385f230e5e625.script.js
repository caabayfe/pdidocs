/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    helpers.snHttp('/api/sn_instance_clone/clone/util', {
        method: 'POST',
        body: {
            operation: 'CREATE_OAUTH_APP_CLIENT',
            sourceInstanceUrl: api.context.props.instanceUrl
        },
        batch: false  // default is true (batched); set false for immediate execution
    }).then(({ response }) => {
        const result = response.result;
        if(result.error) {
            api.setState('clientIDSetupErrorMsg', result.message);
            api.setState('hideclientIDSetupErrorMsg',false);
        }
        else {
            var clientID_label = api.state.clientID;
            clientID_label[0].value.value = result.client_id;
            api.setState('clientID', JSON.parse(JSON.stringify(clientID_label)));
            api.setState('hideClientIdBox', false);
        }
    }).catch(({ error }) => {
        console.error('Error:');
        api.setState('clientIDSetupErrorMsg', 'Exception occured while creating Oauth Client.');
        api.setState('hideclientIDSetupErrorMsg',false);
    });
}
