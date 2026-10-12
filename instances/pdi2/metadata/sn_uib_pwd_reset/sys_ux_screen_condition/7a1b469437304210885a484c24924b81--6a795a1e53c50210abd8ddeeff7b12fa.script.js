(function validateRequest(params) {
    var token = params.payload ? params.payload.token : null;
    return new sn_uib_pwd_reset.PwdResetUXFUtil().validateToken(token);
})(inputProperties);
