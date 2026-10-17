function transform(input) {
    var evaluateAccessAPI = new sn_identity.IdentitySecurityApi();
    return evaluateAccessAPI.evaluateAccess(input.requestPayload);
}
