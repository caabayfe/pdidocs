function previewSOAPMessageScript() {
  // the following is what we have to do to make this client
  // script work from a list and form, with today's code
  if (typeof rowSysId == 'undefined')
     sysId = gel('sys_uniqueValue').value;
  else
     sysId = rowSysId;

  var map = new GwtMessage().getMessages(["Preview SOAP message script usage"]);
  var gr = new GlideRecord("sys_soap_message_function");
  gr.addQuery("sys_id", sysId);
  gr.query();
  if(gr.next()) {
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var dd = new dialogClass("preview_soap_message_script");
    dd.setTitle(map["Preview SOAP message script usage"]);
    dd.setPreference('sysparm_id', sysId);
    dd.render();
  } else {
    alert("SOAP message not found: " + sysId);
  }
}
