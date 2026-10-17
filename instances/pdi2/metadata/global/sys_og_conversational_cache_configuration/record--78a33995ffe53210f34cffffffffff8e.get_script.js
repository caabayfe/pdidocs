(function() {
    var channel = sn_cs.VASystemObject.getChannelById(sys_id);
	if(!channel) {
		throw new Error("could not fetch channel with sys_id: " + sys_id);
	}
    return channel;
})();
