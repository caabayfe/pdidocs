function script({api, event}) {  
  const { errors } = event.payload;
  const { requestId } = api.state.requestMetadata;
  api.data.sn_record_list_data_broker.dataFetchFailed({
    errors,
    requestId
  });
}
