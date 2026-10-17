function transform(input) {
  var wrapperFunction = function() {
    var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
    return proxy.getCertSchedulesCounts();
  };

  return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager - Get Certification Schedules Counts", wrapperFunction);
}
