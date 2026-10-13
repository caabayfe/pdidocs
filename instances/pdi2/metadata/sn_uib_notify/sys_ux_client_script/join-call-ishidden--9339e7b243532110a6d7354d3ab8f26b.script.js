  /**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
     var data = api.data.fetch_conference_calls.output;
    if (!data)
        return true;
    var sp;
    if (api.item.value.sp)
        sp = api.item.value.sp.name;
    var serviceProviderCaps = data.serviceProviderCaps;
    var isSelfJoinAllowed = serviceProviderCaps[sp] && serviceProviderCaps[sp].selfJoin && serviceProviderCaps[sp].selfJoin.isSupported;
    return !api.item.value.active || api.item.value.isLoggedInUserActiveParticipant || !isSelfJoinAllowed;
}
