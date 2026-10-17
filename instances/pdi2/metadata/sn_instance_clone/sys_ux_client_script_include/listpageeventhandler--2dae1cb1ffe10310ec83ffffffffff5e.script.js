function include({ imports }, api, helpers) {
    function loaderComponent(show) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: show,
            label: "Loading...",
            action: null,
            nonBlocking: false
        });
    }
    function openExternalPage(url) {
        api.emit('NAV_ITEM_SELECTED', {
            "external": {
                "url": url
            }
        });
    }

    function _cacheRegisterInstanceModalParams() {
        var _modalParams = {
            "newTargetUrl": api.state.newTargetUrl,
            "hideClientIdContainer": api.state.hideClientIdContainer,
            "disableNewTargetButton": api.state.disableNewTargetButton,
            "targetClientID": api.state.targetClientID,
            "disableCompleteSetupBtn": api.state.disableCompleteSetupBtn,
            "hideOAuthErrorSetup": api.state.hideOAuthErrorSetup,
            "oauthAddInstance": api.state.oauthAddInstance
        };
        api.setState("registerInstanceModalParams", _modalParams);
    }
    
    function callUtilAPI(body, loaderNeeded) {
        if (loaderNeeded) loaderComponent(true);
        return helpers.snHttp('/api/sn_instance_clone/clone/util', {
            method: 'POST',
            body: {
                ...body
            }
        }).then(response => {
            callbackHandler(body, response.response);
        }).catch(response => {
            try {
                api.setState("hideOAuthErrorSetup", false);
                helpers.modal.open('register_instance');
                console.log(body.operation + " failed: " + JSON.stringify(response.error));
            } catch (e) {
                console.log(body.operation + " failed: " + JSON.stringify(response));
            }
        });
    }
    function callbackHandler(body, response) {
        var result = response.result;
        switch (body.operation) {
            case 'CHECK_TARGET_OAUTH_SETUP':
                if (result.ready)
                    api.setState("isIntanceAddedByOAuth", true);
                else
                    api.setState("isIntanceAddedByOAuth", false);
                helpers.modal.open('list_modal');
                break;
            case 'CHECK_TARGET_OAUTH_ELIGIBLE':
                if (result.isError) {
                    if(result.isSelf) {
                        api.setState('hideOAuthErrorSetup', false);
                        api.setState('errorMessageModal',result.message);
                        api.setState("newTargetUrl", "");
                    }
                    else {
                        api.setState("showErrorMessage", false);
                        api.setState("showMsg", false);
                        let modelParams = {
                            "instance_name": api.state.translations.addNewCloneInstanceMsg,
                            "instance_url": body.instanceUrl,
                            "admin_user": "",
                            "admin_password": "",
                            "show_warning": true,
                            "modal_type": "create"
                        };
                        api.setState('modelParams', modelParams);
                        helpers.modal.open('list_modal');
                        helpers.modal.close('register_instance');
                    }
                } else {
                    openExternalPage(body.instanceUrl + "/now/clone/ui/oauth-setup/" + result.sourceUrl);
                    api.setState("hideOAuthErrorSetup", true);
                    api.setState('hideClientIdContainer', false);
                    helpers.timing.setTimeout(() => {
                        helpers.modal.open("register_instance");
                    }, 500);
                }
                break;
            case 'CREATE_OAUTH_APP_PROVIDER':
                _cacheRegisterInstanceModalParams();
                if (result.error) {
                    api.setState('hideOAuthErrorSetup', false);
                    api.setState('errorMessageModal',result.message);
                } else {
                    api.setState('errorMessageModal',null);
                    var iframeUrl = api.state.iFrameUrl;
                    var _iframeUrl = iframeUrl.replace(/&?oauthProf=[^&]*/g, '');
                    _iframeUrl += '&oauthProf=' + result.oauth_entity_profile;
                    api.setState('iFrameUrl', _iframeUrl);
                    console.log('Response: ' + JSON.stringify(result));
                    helpers.timing.setTimeout(() => {
                        helpers.modal.open('iframe_1');
                    }, 100);
                }
                break;
            case 'IFRAME_CLOSED':
            case 'CHECK_OAUTH_TOKEN':
                if (result.ready) {
                    helpers.timing.clearInterval(body.intervalId);
                    api.setState("pollTokenIntervalId", null);
                    callUtilAPI({
                        operation: "ADD_OAUTH_INSTANCE",
                        instanceUrl: api.state.newTargetUrl,
                        registerInstance: true
                    });
                } else if (result.cancelled) {
                    if (body.operation !== "IFRAME_CLOSED") {
                        helpers.timing.clearInterval(body.intervalId);
                        helpers.modal.close('iframe_1');
                    }
                    api.setState("hideOAuthErrorSetup", false);
                    helpers.modal.open('register_instance');
                }
                break;
            case 'ADD_OAUTH_INSTANCE':
                var modelParams = api.state.modelParams;
                if (result.error) {
                    api.setState("hideOAuthErrorSetup", false);
                    helpers.modal.open('register_instance');
                } else {
                    api.setState("timestamp", Date.now());
                    api.setState("showErrorMessage", false);
                    api.setState("showMsg", !api.state.showMsg);
                    helpers.modal.close('iframe_1');
                    helpers.modal.close('register_instance');
                    helpers.translate("Instance {0} Saved successfully", body.instanceUrl)
                    .then((val) => {
                        modelParams.response_message = val;
                        modelParams.response_variant = "info";
                        api.setState("modelParams", JSON.parse(JSON.stringify(modelParams)));
                    });
                }
                break;
        }
        loaderComponent(false);
    }
    return {
        callUtilAPI
    };
}
