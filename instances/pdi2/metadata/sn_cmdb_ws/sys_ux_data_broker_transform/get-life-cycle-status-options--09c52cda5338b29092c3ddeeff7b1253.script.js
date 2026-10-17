function transform(input) {
    var wrapperFn = function() {
      var manualCreateCiService = new sn_cmdb_ws.CMDBWsManualCreateCIService();
      return manualCreateCiService.filterLifeCycleStageStatus(input.ciClassName, input.lifeCycleStage, input.searchText);
    };
    
    return new CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_mcc", "Get Life Cycle Status Options", wrapperFn);
}
