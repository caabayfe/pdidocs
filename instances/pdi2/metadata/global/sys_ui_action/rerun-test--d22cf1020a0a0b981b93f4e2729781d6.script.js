current.update();

var sg = new sn_ws.SOAPMessageTest();

var sgr = new GlideRecord("sys_soap_message_function");
sgr.addQuery("sys_id", current.soap_function.sys_id);
sgr.query();
if (sgr.next()) {
  var tgr = sg.test(sgr, current.request);
  action.setRedirectURL(tgr);
}
