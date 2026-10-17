function script({api, event}) {
    api.data.sn_record_list_data_broker.predicateBuilderSetQuery(event.payload);
}
