(function() {
    var provider = sn_cs.VASystemObject.getProviderById(sys_id);
	if(!provider) {
		throw new Error("could not fetch provider with sys_id: " + sys_id);
	}
    return provider;
})();
