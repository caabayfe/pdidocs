function script({api, event}) {  
    //only set loading state when data fetch has not been completed
  if (api.data.form_GQL_data_broker_output?.output === undefined && api.data.check_data_fabric_operation?.output) {
        api.emit('CTRL_RECORD#FORM_LOADING_STATE_CHANGED', {
            loading: true,
            label: "Loading external data may take longer."
        });
    }
}
