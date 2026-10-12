function handler({api, event, imports}) {
    api.setState('templateModalSelectedValue', event.payload.value);
}
