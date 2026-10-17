function script({api, event}) {  
  const { errors } = event.payload;
  api.data.sn_record_list_data_broker.fetchChildrenCountFailed({
    errors
  });
}
