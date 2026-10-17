(function() {
	const token = new sn_msteams.MsAuthToken().getOutboundAuthToken(inbound_id);
	if(!token) {
		throw new Error('token could not be generated for inbound_id:' + inbound_id);
	}
	return token;
})();
