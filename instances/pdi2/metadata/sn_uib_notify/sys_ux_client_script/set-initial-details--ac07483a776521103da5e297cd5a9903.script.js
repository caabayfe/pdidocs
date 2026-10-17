/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const data = api.data.notify_conference_get_initial_data.output;
    let notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (!data) {
        notifyConfUtils.resetModal(api);
    }

    if (!data.isNotifyConferenceConfiguredProperly) {
        notifyConfUtils.showAlert(api, data.conferenceMessages["Notify is not properly configured. Please contact your system administrator"], "critical");
        api.setState("disableStart", true);
        return;
    }

    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.addParticipants) {
        if (!api.context.props.conferenceId) {
            notifyConfUtils.showAlert(api, data.conferenceMessages["No conference call to add participant to."], "critical");
            api.setState("disableStart", true);
            return;
        }
        api.setState("disableConferenceTitle", true);
    }

    if (!data.showPage) {
        api.setState("pageError", data.conferenceMessages["As per the configurations, you do not have access to this page. Please contact the system administrator"]);
        api.setState("showPage", false);
        return;
    }

    const serviceProviders = [];
    for (let index in data.serviceProviders) {
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"]) {
            if (data.serviceProviders[index].provider == notifyConfUtils.TELEPHONY_PROVIDER) {
                serviceProviders.push(data.serviceProviders[index]);
            }
        } else {
            serviceProviders.push(data.serviceProviders[index]);
        }
    }

    if (serviceProviders.length == 0) {
        notifyConfUtils.showAlert(api, data.conferenceMessages["Notify is not properly configured. Please contact your system administrator"], "critical");
        api.setState("disableStart", true);
        return;
    }

    const provider = serviceProviders[0].provider;
    //Set providers and initial default provider
    api.setState("providerSelectors", serviceProviders);
    if (api.context.props.serviceProvider) {
        // Set service provider provided in props
        const providerData = api.context.props.serviceProvider;
        for (let index in serviceProviders) {
            if (providerData.provider == notifyConfUtils.TELEPHONY_PROVIDER) {
                if (providerData.number == serviceProviders[index].number) {
                    api.setState("selectedProvider", serviceProviders[index]);
                    break;
                }
            } else {
                if (providerData.provider == serviceProviders[index].provider) {
                    api.setState("selectedProvider", serviceProviders[index]);
                    break;
                }
            }
        }
    } else {
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.addParticipants) {
            if (!data.defaultServiceProvider) {
                notifyConfUtils.showAlert(api, data.conferenceMessages["Notify is not properly configured. Please contact your system administrator"], "critical");
                api.setState("disableStart", true);
                return;
            }
            let foundProvider = false;
            for (let index in data.serviceProviders) {
                if (data.serviceProviders[index].provider == data.defaultServiceProvider) {
                    api.setState("selectedProvider", data.serviceProviders[index]);
                    foundProvider = true;
                }
            }
            if (!foundProvider) {
                return;
            }

        } else {
            //Set provider for initial start conference case when not provided in props
            let defaultProvider;
            for (let index in data.serviceProviders) {
                if (data.serviceProviders[index].defaultFlag) {
                    defaultProvider = data.serviceProviders[index];
                }
            }
            if (defaultProvider) {
                api.setState("selectedProvider", defaultProvider);
            } else {
                api.setState("selectedProvider", serviceProviders[0]);
            }
        }
    }

    // Set conference Title
    if (api.context.props.conferenceTitle) {
        api.setState("conferenceTitle", api.context.props.conferenceTitle);
    } else {
        if (data.conferenceTitle) api.setState("conferenceTitle", data.conferenceTitle);
    }

    let providerForTitle;
    if (api.context.props.serviceProvider && api.context.props.serviceProvider.provider) {
        providerForTitle = api.context.props.serviceProvider.provider;
    } else {
        providerForTitle = provider;
    }
    if (notifyConfUtils.isProviderActionSupported(data.serviceProviderCaps[providerForTitle], "title") && api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["startConference"]) {
        api.setState("disableConferenceTitle", false);
    }

    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.startConference && api.context.props.participants && api.context.props.participants.length > 0) {
        api.setState("reinitiate", true);
    }

    // Set Conference Message
    if (api.context.props.conferenceMessage) {
        api.setState("message", api.context.props.conferenceMessage);
    }

    if (serviceProviders.length > 1) api.setState("disableProviderSelection", false);

    //Set max length for sms
    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"] && data.smsMaxLength)
        api.setState("smsMaxLength", data.smsMaxLength);
}
