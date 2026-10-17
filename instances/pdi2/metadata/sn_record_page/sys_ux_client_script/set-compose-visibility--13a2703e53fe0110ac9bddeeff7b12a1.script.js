function script({api, event}) {
	const { payload: { isEmpty } } = event;
   	api.setState('isComposeVisible',  !isEmpty, false);
}
