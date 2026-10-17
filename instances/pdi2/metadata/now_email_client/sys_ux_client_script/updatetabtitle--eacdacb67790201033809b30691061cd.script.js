function script({
    api,
    event
}) {
    const payload = {isDirty: false};
    if (event.name === 'NOW_EMAIL_CLIENT_COMPOSER_CONNECTED#FORM_UPDATE_HEADER') {
        payload.title = event.payload.recordDisplayValue;
        api.emit('SCREEN_STATUS_CHANGED', payload);
    } else if (event.name === 'NOW_EMAIL_CLIENT_COMPOSER_CONNECTED#DRAFT_INITIALISED' && api.context.props.sysId != '-1') {
        payload.title = event.payload.subject;
        api.emit('SCREEN_STATUS_CHANGED', payload);
    }
}
