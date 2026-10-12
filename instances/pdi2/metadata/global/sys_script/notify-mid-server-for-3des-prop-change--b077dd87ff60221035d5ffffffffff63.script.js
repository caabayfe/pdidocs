(function executeRule(current, previous /*null when async*/) {
	var sysProperty3DES = ["glide.security.3des.encryption.allow",
	                "glide.security.3des.static_keys_usable",
	                "glide.security.glideencrypter.allow",
	                "glide.security.glideencrypter.aes.encryption.allow",
	                "glide.kmf.customer_level_encrypter.enabled"];
	
	if(sysProperty3DES.includes(String(current.name)) && (current.operation() == 'delete' || previous.value != current.value)) {
		//notify MID Server
		gs.eventQueue('reload.mid.encrypterApiData', null, "", "");
	}

})(current, previous);
