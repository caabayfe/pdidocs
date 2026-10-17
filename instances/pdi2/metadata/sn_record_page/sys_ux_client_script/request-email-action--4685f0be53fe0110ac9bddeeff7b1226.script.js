function script({api, event}) {
	api.setState('composeEmailInfo',  event.payload);
}
