function transform(input) {
    var debugLogAPI = new sn_identity.IdentitySecurityApi();
    var baseUserAccessResult = debugLogAPI.getDebugLog(input.baseUserRequestPayload);
    var modelUserAccessResult = debugLogAPI.getDebugLog(input.modelUserRequestPayload);

    return {
        "baseUserAccessResult": baseUserAccessResult,
        "modelUserAccessResult": modelUserAccessResult
    };
}
