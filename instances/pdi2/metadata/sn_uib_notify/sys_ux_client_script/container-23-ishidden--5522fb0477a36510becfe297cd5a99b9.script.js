/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let initialData = api.data.get_conference_initial_details.output;
    if (!initialData)
        return true;

    let sp;
    if (initialData.conferenceDetails && initialData.conferenceDetails.call && initialData.conferenceDetails.call.sp)
        sp = initialData.conferenceDetails.call.sp.name;
    if (!sp) {
        return true;
    }
    let serviceProviderCaps = initialData.serviceProviderCaps;
    let isMuteSupported = serviceProviderCaps[sp] && serviceProviderCaps[sp].mute && serviceProviderCaps[sp].mute.isSupported;
    let isUnmuteSupported = serviceProviderCaps[sp] && serviceProviderCaps[sp].unmute && serviceProviderCaps[sp].unmute.isSupported;
    let isSpeakingSupported = serviceProviderCaps[sp] && serviceProviderCaps[sp].speaking && serviceProviderCaps[sp].speaking.isSupported;
    let isCallActive = api.state.confDetails ? api.state.confDetails.active : false;

    //Support check or call active check
    if (!isCallActive || !(isMuteSupported || isUnmuteSupported || isSpeakingSupported)) {
        return true;
    }
    return false;
}
