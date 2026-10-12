(function executeRule(current, previous /*null when async*/) {
    const INSTANCE_LEVEL_GLIDE_ENCRYPTER = '401fa53c5b6220106cdba88ddc81c754';
    const PARENT_CRYPTO_MODULE = '7d7ee9e3b7030010ebf7082e7e11a979';
    const CUSTOMER_LEVEL_ENCRYPTER = '178fc29b376c2210fa1b18c734924b7c';

	if (current.getValue("crypto_module") == INSTANCE_LEVEL_GLIDE_ENCRYPTER ||
	    current.getValue("crypto_module") == PARENT_CRYPTO_MODULE ||
	    current.getValue("crypto_module") == CUSTOMER_LEVEL_ENCRYPTER) {
		//notify MID server about key changes that are in use by MID.
		gs.eventQueue('reload.mid.encrypterApiData', null, "", "");
	}

})(current, previous);
