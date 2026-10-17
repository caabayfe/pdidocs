function handler({api, event, imports}) {
    if (event.payload && event.payload.title)
    	api.emit('SCREEN_STATUS_CHANGED', {title: event.payload.title});
}
