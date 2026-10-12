function onBefore(current, previous) {
	if ((!gs.nil(current.authentication_protocol) && String(current.authentication_key.getDecryptedValue()).length < 8) ||
		(!gs.nil(current.privacy_protocol) && String(current.privacy_key.getDecryptedValue()).length < 8) ||
		(gs.nil(current.authentication_protocol) && !gs.nil(current.privacy_protocol))) {
			gs.addErrorMessage(gs.getMessage('Invalid update'));
			current.setAbortAction(true);
	}
}
