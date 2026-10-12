// eslint-disable-next-line no-unused-vars
function policy({ trigger, properties, api }) {
	const { hideSend, showSendButtonAsIcon } = properties;

	function initiateUpdates() {
		updateSendEmailButtonSizeVisibility();
		updateInitiateSendEmailVisibility();
	}

	function updateSendEmailButtonSizeVisibility() {
		api.updateVisibility('sendEmailButtonSize', showSendButtonAsIcon !== true);
	}

	function updateInitiateSendEmailVisibility() {
		const isHideSend = hideSend === true;
		api.updateVisibility('initiateSendEmail', isHideSend);
	}

	//initial load
	if (!trigger) {
		initiateUpdates();
	} else if (trigger === 'hideSend') {
		updateInitiateSendEmailVisibility();
	} else if (trigger === 'showSendButtonAsIcon') {
		updateSendEmailButtonSizeVisibility();
	}
}
