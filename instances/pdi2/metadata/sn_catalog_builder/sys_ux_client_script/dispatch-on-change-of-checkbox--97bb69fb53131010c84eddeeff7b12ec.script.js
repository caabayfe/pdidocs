function handler({
    api,
    event,
    imports
}) {
    let val = JSON.stringify({
        active: event.payload.value,
        display: true
    });
    api.emit('SC_FORM_VALUECHANGE',  {
        value: val
    });
}
