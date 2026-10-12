function script({api, event}) {
	api.setState('hasUserTypedEmailContent', event.payload.hasUserTypedEmailContent);
}
