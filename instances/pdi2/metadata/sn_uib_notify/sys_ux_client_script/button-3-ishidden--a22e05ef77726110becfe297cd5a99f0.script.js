/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var initialData = api.data.get_conference_initial_details.output;
    if (!initialData)
        return true;

    var sp;
    if (initialData.conferenceDetails && initialData.conferenceDetails.call && initialData.conferenceDetails.call.sp)
        sp = initialData.conferenceDetails.call.sp.name;
    var serviceProviderCaps = initialData.serviceProviderCaps;
    var isSelfJoinAllowed = serviceProviderCaps[sp] && serviceProviderCaps[sp].selfJoin && serviceProviderCaps[sp].selfJoin.isSupported;
    return !(api.state.confDetails.active && !api.state.isLoggedInUserActiveParticipant && isSelfJoinAllowed);
}
