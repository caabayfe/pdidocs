function script({api, event, helpers, imports}) {
    const value = event.payload.value;
    api.setState('runAsUserDefaultPropValue', value);
}
