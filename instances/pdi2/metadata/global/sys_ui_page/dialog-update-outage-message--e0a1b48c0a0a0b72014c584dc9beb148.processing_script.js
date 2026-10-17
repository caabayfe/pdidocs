processNewOutageMessage();

function processNewOutageMessage() {
  var outage = new GlideRecordSecure("cmdb_ci_outage");
  if (outage.get(outage_id)) {
    outage.message = new_message_input;
    outage.update();
  }
  response.sendRedirect("home.do");
}
