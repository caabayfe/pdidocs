function transform(input) {
    var wrapperFn = function() {
      var manualCreateCiService = new sn_cmdb_ws.CMDBWsManualCreateCIService();
      return manualCreateCiService.filterLifeCycleStage(input.ciClassName, input.searchText);
    };
    
    return new CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_mcc", "Get Life Cycle Stage Options", wrapperFn); 
}
