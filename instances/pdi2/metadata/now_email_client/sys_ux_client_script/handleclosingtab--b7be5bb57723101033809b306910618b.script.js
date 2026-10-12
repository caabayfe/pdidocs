function handler({api, event}) {
	    api.emit('SCREEN_STATUS_CHANGED', {status: 'closed'});
}
