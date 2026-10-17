function onCondition() {
  var sysid = gel('sys_uniqueValue').value;
  var gr = new GlideRecord("sys_attachment");
  gr.addQuery("table_name", "sys_certificate");
  gr.addQuery("table_sys_id", sysid);
  gr.query();
  if (!gr.next()) {
    alert("Please attach DER encoded certificate file");
  }
}
