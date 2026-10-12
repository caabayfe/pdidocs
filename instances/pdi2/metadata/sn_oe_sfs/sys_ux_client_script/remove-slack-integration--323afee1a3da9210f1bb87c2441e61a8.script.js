/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.snHttp('/api/sn_oe_sfs/sidebar_external_integrations/slack', {
        method: 'POST',
        body: {
            operation: 'DELETE_CONFIG'
        }
    }).then(response => {
        if (response.response.result.error === false) {
            var pageParams = api.state.pageParams;
            delete pageParams.providerApplications['Slack Application'];
            pageParams.readOnly = false;
            pageParams.isSlackConfigured = false;
            api.setState("pageParams", pageParams);
            api.data.ace_fetch_content_blocks.refresh();
            displayMessage(api, response.response.result.message);
        }
    }).catch(response => {
        try {
            displayError(api, response.result.message);
            console.log(response.body.operation + " failed: " + JSON.stringify(response.error));
        } catch (e) {
            console.log(response.body.operation + " failed: " + JSON.stringify(response));
        }
    });

    function displayError(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'critical',
                icon: 'exclamation-triangle-outline',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }

    function displayMessage(api, message) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'sev-1',
                status: 'info',
                icon: 'check_fill',
                content: {
                    type: 'html',
                    value: '<span>' + message + '</span>'
                },
                action: {type: 'dismiss'}
            }]
        });
    }
}
