function transform(input) {
    var debugLogAPI = new sn_identity.IdentitySecurityApi();
    return debugLogAPI.getDebugLog(input.requestPayload);
}
