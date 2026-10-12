/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	//Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
	const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

	const {eventName, eventPayload} = event.payload;
    var blockcontext = eventPayload.blockcontext;
    var replaceActiveIntegrationModal = "c25b-6dfe-9ba8b9-fb19-b89b43a9";
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
	
    switch(eventName) {
        case 'dismiss_alert':
            blockcontext.showAlertMessage = false;
            publish();
            break;
        case 'save_config':
            // if Teams is enabled and preference channel is not set to Slack, show modal 
            if (blockcontext.preferenceChannel !== "a2db3911a3f382106cdec213d51e6181" && (!blockcontext.isSlackConfigured || blockcontext.isSlackEnabled) && blockcontext.isTeamsEnabled) {
                aceUtils.openModal(replaceActiveIntegrationModal);
            } else {
                saveConfig();
            }
            break;
        case 'modal_continue':
            saveConfig();
            aceUtils.dismissModal(replaceActiveIntegrationModal);
            break;
        case 'modal_cancel':
            aceUtils.dismissModal(replaceActiveIntegrationModal);
            break;
        case 'input_client_id':
            blockcontext.clientId = eventPayload.value;
            publish();
            break;
        case 'input_client_secret':
            blockcontext.clientSecret = eventPayload.value;
            publish();
            break;
        case 'input_signing_secret':
            blockcontext.signingSecret = eventPayload.value;
            publish();
            break;
        case 'bot_user_oauth_token':
            blockcontext.botUserOauthToken = eventPayload.value;
            publish();
            break;
        case 'sidebar_and_slack_overview':
            var instanceName = blockcontext.instanceName;
            var url = instanceName + "api/now/v1/context_doc_url/sidebar-slack-overview";
            navigateTo(url, "_blank");
            break;
        case 'toggle':
            blockcontext.isSlackEnabled = eventPayload.value;
            publish();
            break;
    }

    function saveConfig() {
        var credentials = {};
        credentials.clientId = blockcontext.clientId;
        credentials.clientSecret = blockcontext.clientSecret;
        credentials.signingSecret = blockcontext.signingSecret;
        credentials.botUserOauthToken = blockcontext.botUserOauthToken;
        // pass in true when this is the first time setting up Slack
        var isSlackEnabled = blockcontext.isSlackConfigured ? blockcontext.isSlackEnabled : true;
        callAPI({
            operation: 'SAVE_CONFIG',
            credentials: credentials,
            isSlackEnabled: isSlackEnabled
        });
        aceUtils.refreshContentBlock('sidebar_slack_setup');
    }

    function callAPI(body) {
        return helpers.snHttp('/api/sn_oe_sfs/sidebar_external_integrations/slack', {
            method: 'POST',
            body: {
                ...body
            }
        }).then(response => {
            callbackHandler(body, response.response);
        }).catch(response => {
            try {
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
    };
    
    function callbackHandler(body, response) {
        switch (body.operation) {
            case 'SAVE_CONFIG': 
                blockcontext.showAlertMessage = true;
                blockcontext.alertMessage = response.result.message; 
                
                if (response.result.error)
                    blockcontext.alertVarient = "critical";
                else 
                    blockcontext.alertVarient = "positive";
                     
                publish();
                break;
        }
    };

    function publish() {
        aceUtils.setContext(blockcontext);
    };

    function navigateTo(url, target) {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: url,
                target: target
            }
        });
    }
}
