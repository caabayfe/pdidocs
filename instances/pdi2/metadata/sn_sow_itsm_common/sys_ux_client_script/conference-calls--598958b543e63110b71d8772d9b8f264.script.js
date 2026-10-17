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
    const recordInfoUtils = imports['sn_sow_itsm_common.SOWRecordInformationUtils']();
    const spIconMapping = recordInfoUtils.getSpIconMapping();
    var activeCalls = [];
    const {
        tcm,
        notify,
        telephoneProviderType
    } = api.data.get_active_conferences_1.output;

    if (tcm && tcm.activeCalls) {

        const callsKeys = Object.keys(tcm.activeCalls);
        for (let i = 0; i < callsKeys.length; i++) {

            var call = tcm.activeCalls[callsKeys[i]];
            if (call.active.value === "false") break;
            let link = '';
            let spTcm = '';

            if (call.service_provider && call.service_provider.value) {
                spTcm = call.service_provider.value;
                if (spTcm === "Telephony") {
                    api.setState("twilioAlert", true);
                    spTcm = "TwilioDirect";
                }
            }

            if (call.service_provider_data && call.service_provider_data.value) {
                let callData = JSON.parse(call.service_provider_data.value);
                link = callData.joinUrl;
            }

            if (call.conference_title && call.conference_title.display_value) {
                var temp = {
                    "title": call.conference_title.display_value,
                    "icon": spIconMapping[spTcm],
                    link
                };
                activeCalls.push(temp);
            }
        }
    }
    if (notify && notify.calls) {
        const calls = notify.calls;
        for (let i = 0; i < calls.length; i++) {
            if (calls[i].callStatus && calls[i].callLabel.toLowerCase().includes('active') && calls[i].callRecords) {
                const callRecords = calls[i].callRecords;
                for (var j = 0; j < callRecords.length; j++) {
                    const {
                        sp,
                        title,
                        invite,
                        active
                    } = callRecords[j];
                    let link = '';
                    let icon = '';
                    if (!active) break;

                    if (sp && sp.icon) {
                        icon = sp.icon;
                    }
                    if (sp && sp.name != telephoneProviderType && invite) {
                        link = invite;
                    } else if (sp.name == telephoneProviderType) {
                        api.setState("twilioAlert", true);
                    }
                    if (title && title.original) {
                        var call = {
                            "title": title.original,
                            icon,
                            link
                        };
                        activeCalls.push(call);
                    }
                }
            }
        }
    }

    if (activeCalls.length > 0) {
        api.setState("hideActiveCalls", false);
    }
    if (activeCalls.length > 5) {
        api.setState("allActiveCalls", activeCalls.slice(0, 5));
    } else {
        api.setState("allActiveCalls", activeCalls);
    }
}
