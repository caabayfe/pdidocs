data.tokenFound = false;
data.redirectUrl = '';
var oauthProfileId = $sp.getParameter('oauthProf');


function isExpired(expiresIn, withinSeconds) {
    if (expiresIn > withinSeconds)
        return false;
    return true;
}

function getOAuthToken(oauthRequestorSysId, oauthProfileId) {
    var client = new sn_auth.GlideOAuthClient();
    var _token = client.getToken(oauthRequestorSysId, oauthProfileId);
    if (_token && _token.getAccessToken() && !isExpired(_token.getExpiresIn(), 30))
        return true;
    return false;
}

function buildRedirectUrl(oauthRequestorContext, oauthRequestorSysId, oauthProfileId) {
    var oauth_initiator_url = '/oauth_initiator.do' +
        '?oauth_requestor_context=' + oauthRequestorContext +
        '&oauth_requestor=' + oauthRequestorSysId +
        '&oauth_provider_profile=' + oauthProfileId +
        '&response_type=code';
    return oauth_initiator_url;
}

if (input && input.action === 'cancel') {
    gs.getUser().savePreference(CloneConstants.oAuthAppConstants.CANCEL_PREF_NAME, 'true');
} else {
    var token = getOAuthToken(CloneConstants.oAuthAppConstants.REQUESTOR_ID, oauthProfileId);
    if (!token) {
        data.tokenFound = false;
        data.redirectUrl = buildRedirectUrl(CloneConstants.oAuthAppConstants.REQUESTOR_CONTEXT, CloneConstants.oAuthAppConstants.REQUESTOR_ID, oauthProfileId);
    } else {
        data.tokenFound = true;
    }
}
