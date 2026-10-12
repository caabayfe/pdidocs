/*
* Some practical considerations.
* 1. The database should never store unecrypted private key. By doing setAbortAtion, the UI will maintain 
*    the invalid value, but not in the database.
* 2. We should always have the right message telling the user why the private key is incorrect
*/

(function() {
	var curKey = current.ssh_private_key;
	
	if (! global.SSHPrivateKeyCredentialUtils.keyIsInCorrectFormat(curKey)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The SSH private key must start with '-----BEGIN'."));		
		return;
	}
	
	current.ssh_private_key = global.SSHPrivateKeyCredentialUtils.encryptUsingKMFCryptoOperation(curKey);
	
})();
