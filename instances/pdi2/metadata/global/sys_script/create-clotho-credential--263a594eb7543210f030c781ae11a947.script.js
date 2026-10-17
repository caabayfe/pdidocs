(function executeRule(current, previous /* null when async */) {
  // Active check; the Condition also filters by service
  var active = current.getValue("active");
  if (!(active == "1" || active == "true")) {
    return;
  }
  new ClothoAliasBinder().syncByEndpoint(current);
})(current, previous);
