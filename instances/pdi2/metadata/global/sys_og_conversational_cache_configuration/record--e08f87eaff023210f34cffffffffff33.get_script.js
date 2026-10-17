(function() {
    var providerApp = sn_cs.VASystemObject.getProviderAppByInboundAndProviderId(inbound_id, "");
	if(!providerApp) {
		throw new Error("could not fetch provider app with inbound id: " + inbound_id);
	}
    return providerApp;
})();
