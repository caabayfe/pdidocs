(function() {
    const x = new sn_cs_adapter.VaLinkAccountUtil();
    const challengeUrl = x.getChallengeURL('', device_type, provider_channel_identity_id, provider_user_id, provider_user_name, '');
	if(!challengeUrl) {
		throw new Error('challenge url could not be generated for: ' + JSON.stringify({device_type, provider_channel_identity_id, provider_user_id, provider_user_name}));
	}
	return challengeUrl;
})();
