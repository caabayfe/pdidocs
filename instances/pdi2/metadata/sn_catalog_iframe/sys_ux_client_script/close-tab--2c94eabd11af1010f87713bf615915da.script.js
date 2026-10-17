function handler({api, event, imports}) {
    api.emit('SCREEN_STATUS_CHANGED', {status: 'closed'});
}
