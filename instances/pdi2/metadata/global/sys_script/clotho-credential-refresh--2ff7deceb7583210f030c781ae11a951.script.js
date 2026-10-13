(function executeRule(current, previous /* null when async */) {
  try {
    // Find any active MetricBase endpoint that uses this auth and refresh
    var ep = new GlideRecord("sys_service_endpoint");
    ep.addQuery("authentication", current.getUniqueValue());
    ep.addQuery("active", true);
    ep.addQuery("service", "21785bc1c3231010d6b5cc8f5e40dd50"); // MetricBase
    ep.setLimit(1);
    ep.query();
    if (ep.next()) {
      new ClothoAliasBinder().syncByEndpoint(ep);
    }
  } catch (e) {
    gs.error("Clotho auth BR error: " + e.message);
  }
})(current, previous);
