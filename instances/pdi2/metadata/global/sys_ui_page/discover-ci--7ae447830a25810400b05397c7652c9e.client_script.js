function actionOK() {
  var cmdb_ci = gel('sys_uniqueValue').value;
  var ga = new GlideAjax('DiscoveryAjax');
  ga.addParam('sysparm_name','getSysID');
  ga.addParam('sysparm_cmdb_ci',cmdb_ci);
  ga.getXMLWait();
  var sys_id = ga.getAnswer();
  GlideDialogWindow.get().destroy();
  if (sys_id)
    self.location = "discovery_status_list.do?sysparm_query=sys_id=" + sys_id;
}
