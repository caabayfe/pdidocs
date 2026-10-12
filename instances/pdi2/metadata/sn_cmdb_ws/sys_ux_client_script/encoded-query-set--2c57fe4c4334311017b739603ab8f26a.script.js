function script({api, event, imports}) { 
    const { policyData } = api.state;
    if (policyData.data_filter) {
        policyData.data_filter.encoded_query = event.payload.value;
        api.setState('policyData', policyData);
    }
}
