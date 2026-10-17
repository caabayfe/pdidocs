function script({api, event}) {
    const domainId = event.payload.domainId;

    if (domainId)
        api.setState('domainId', domainId);
}
