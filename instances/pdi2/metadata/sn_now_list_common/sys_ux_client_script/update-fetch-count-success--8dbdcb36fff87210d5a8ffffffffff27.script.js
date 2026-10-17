function script({api, event}) {
const output = api.data.fetch_children_count.output
const { parentRowSysIdFullPathKey } = api.state.fetchChildrenPayload;
api.data.sn_record_list_data_broker.fetchChildrenCountSuccess({output,parentRowSysIdFullPathKey});
  }
