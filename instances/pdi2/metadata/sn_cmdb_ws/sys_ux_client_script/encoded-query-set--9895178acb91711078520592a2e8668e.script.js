function script({api, event, imports}) {
    const { dataFilter } = api.state;     
    dataFilter.encoded_query = event.payload.value;
    api.setState("dataFilter", dataFilter);
    
}
