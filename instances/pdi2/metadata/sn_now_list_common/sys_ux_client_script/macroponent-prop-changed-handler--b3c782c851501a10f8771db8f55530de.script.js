function script({api, event}) {
    const { name, value } = event.payload;
    if (name === 'encodedQuery') {
        const { updatedEncodedQuery } = api.state;
        if (updatedEncodedQuery !== value)
            api.setState('updatedEncodedQuery', value);
    }
}
