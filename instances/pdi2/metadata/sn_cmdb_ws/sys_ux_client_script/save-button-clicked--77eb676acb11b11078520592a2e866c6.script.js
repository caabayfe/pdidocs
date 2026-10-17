function script({api, event, helpers, imports}) {  
  //call data broker to send in list of policy types and selected records to add to exclusion list
   var dataBrokerPayload = {
       policyTypesList : api.state.selectedPolicyTypesList,
       recordSelection : api.state.recordSelection,
       dataFilter : api.state.dataFilter
   };

  api.data.data_manager_save_exclusion_list.execute({
     payload : dataBrokerPayload
  });
}
