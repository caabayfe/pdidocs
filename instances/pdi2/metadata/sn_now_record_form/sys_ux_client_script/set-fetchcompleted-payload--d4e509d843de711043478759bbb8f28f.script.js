function script({api, event}) {
	api.setState('fetchCompletedPayload', event.payload, false);
}
