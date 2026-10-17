/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const selectedProvider = api.state.selectedProvider;
    const initialData = api.data.notify_conference_get_initial_data.output;
    let conferenceMessages = initialData.conferenceMessages || {};
    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["startConference"] || api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["addParticipants"] || api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"]) {
        const validateStartData = notifyConfUtils.isValidConferenceStartData(api);
        if (!validateStartData.status) {
            let alerts = [];
            for (let index in validateStartData.errors) {
                alerts.push({
                    message: conferenceMessages[validateStartData.errors[index]],
                    level: "critical"
                });
            }
            if (alerts.length > 0)
                notifyConfUtils.showMultipleAlerts(api, alerts);
            return;
        }

        const selectedParticipantsAndGroups = api.state.selectedParticipantsAndGroups;
        //Creating deep clone
        let notifyTemplate = { ...api.data.notify_conference_get_initial_data.output.notifyTemplate
        };
        //Resetting as data persists
        notifyTemplate.items = [];
        notifyTemplate.allowMulticonference = true;
        notifyTemplate.addToWorkNotes = true;
        notifyTemplate.conferenceTitle = api.state.conferenceTitle ? api.state.conferenceTitle : "";
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"] && api.state.smsMaxLength) {
            notifyTemplate.message = api.state.message ? api.state.message.slice(0, api.state.smsMaxLength) : "";
        } else {
            notifyTemplate.message = api.state.message ? api.state.message.slice(0, notifyConfUtils.DEFAULT_NO_OF_CHAR_MESSAGE) : "";
        }

        if (api.context.props.type != notifyConfUtils.ALLOWED_PAGE_TYPES["addParticipants"]) {
            if (selectedProvider.number && selectedProvider.number.length > 0) {
                //Case for telephony
                notifyTemplate.serviceProvider = notifyConfUtils.TELEPHONY_PROVIDER;
                notifyTemplate.fromNumber = selectedProvider.number;
            } else {
                notifyTemplate.serviceProvider = selectedProvider.id;
            }
        }

        for (let index in selectedParticipantsAndGroups) {
            notifyTemplate.items.push(notifyConfUtils.cleanUpSelectedParticipants(selectedParticipantsAndGroups[index].data));
        }

        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["addParticipants"]) {
            notifyTemplate.table = "";
            notifyTemplate.sysId = "";
            notifyTemplate.isNewConference = false;
            if (!api.context.props.conferenceId) {
                notifyConfUtils.showAlert(api, conferenceMessages[`No conference call to add participant to.`], "critical");
                return;
            }
            notifyTemplate.confId = api.context.props.conferenceId;
            if (selectedProvider.number && selectedProvider.number.length > 0) {
                //Case for telephony
                notifyTemplate.serviceProvider = notifyConfUtils.TELEPHONY_PROVIDER;
            } else {
                notifyTemplate.serviceProvider = selectedProvider.id;
            }
        }
        api.setState("showLoader", true);
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"]) {
            notifyTemplate.isNewConference = false;
            notifyTemplate.isSMS = true;
            api.setState("sendSmsData", notifyTemplate);
        } else {
                let action = "";
                if (initialData.hasAsyncSupport){
                    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["startConference"]){
                        action = notifyConfUtils.confActions.ASYNC_START;
                        if (!notifyConfUtils.isProviderActionSupported(initialData.serviceProviderCaps[selectedProvider.provider], action)){
                            action = notifyConfUtils.getAsyncFallbackAction(initialData.asyncFallbackActions, action);
                        }
                    }
                    else if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["addParticipants"]){
                        action = notifyConfUtils.confActions.ASYNC_MULTI_JOIN;
                        if (!notifyConfUtils.isProviderActionSupported(initialData.serviceProviderCaps[selectedProvider.provider], action)){
                            action = notifyConfUtils.getAsyncFallbackAction(initialData.asyncFallbackActions, action);
                        }
                    }
                }
                else {
                    action = api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["startConference"] ? notifyConfUtils.confActions.START : api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["addParticipants"] ? notifyConfUtils.confActions.MULTI_JOIN : "";
                }
                try {
                    const result = await helpers.snHttp(`/api/sn_uib_notify/notify_uib/conferenceAction`, {
                        method: 'POST',
                        batch: false,
                         body:{
                        conferenceDetails: notifyTemplate,
                        action: action
                    }
                    });
                    handleDoConferenceActionResponse(api, notifyConfUtils, helpers, action, result, null);
                } catch ({
                    error
                }) {
                    handleDoConferenceActionResponse(api, notifyConfUtils, helpers, "", null, error);
                    return;
                }
        }
    }

    async function handleDoConferenceActionResponse(api, notifyConfUtils, helpers, action, result, error) {
        if (result) {
            const serviceProvider = api.state.selectedProvider.provider;
            const supportsPostActionsAndValidations = api.data.notify_conference_get_initial_data.output.supportsEventActionsAndIdentifiers;
            const confDriverActions = api.data.notify_conference_get_initial_data.output.confDriverActions;
            if (!serviceProvider || (typeof supportsPostActionsAndValidations === "undefined") || !confDriverActions)
                return;
            if (!result.response) {
                return;
            }
            const resultFinal = result.response.result;
            if (resultFinal.status === true && action === notifyConfUtils.confActions.START) {
                api.emit("NOTIFY_DO_CONFERENCE_ACTION_SUCCESS", {
                    action: notifyConfUtils.confActions.START,
                    data: resultFinal
                });
                if (api.state.reinitiate) {
                    let message = await helpers.translate("You can view the call details from the call listing page");
                    if (api.context.props.isParentRecordAware) {
                        api.emit(notifyConfUtils.GFORM_ADD_INFO_MESSAGE, {
                            message: message
                        });
                    } else {
                        var payload = {
                            "id": `notify-info-message`,
                            "action": {
                                "type": "dismiss"
                            },
                            "content": {
                                "type": "html",
                                "value": "<div>" + message + "</div>"
                            },
                            "status": "info",
                        };
                        api.emit('NOTIFY_ADD_MESSAGES', [payload]);
                    }
                }
            }
            if (error) {
                if (error.data && error.data.error && error.data.error.message) {
                    const message = error.data.error.message;
                    api.emit(notifyConfUtils.GFORM_ADD_ERROR_MESSAGE, {
                        message: message
                    });
                }
            }
            notifyConfUtils.handleConferenceActionResponse(api, helpers, serviceProvider, supportsPostActionsAndValidations, confDriverActions, true, resultFinal);
        } else {
            api.setState("showLoader", false);
            if (error.data && error.data.error && error.data.error.message) {
                const message = error.data.error.message;
                notifyConfUtils.showAlert(api, message, "critical");
            }
        }
    }
}
