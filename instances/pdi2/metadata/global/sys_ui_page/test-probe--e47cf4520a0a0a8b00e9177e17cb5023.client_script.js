hidePort();
setDefaultMIDServer();
function setDefaultMIDServer(name) {
  if (gel('sys_display.ecc_agent').value != "")
	  return;
	
  var gr = new GlideRecord('ecc_agent');
  gr.addQuery("status", "Up");
  gr.query();
  if (gr.next())
	midName = gr.name;

	
  gel('sys_display.ecc_agent').value = midName;
  gel('ecc_agent').value = gr.sys_id;
}

function hidePort() {
	//Hide Port field if the probe is not HTTPClassyProbe
	var ename = g_form.getValue('ecc_queue_name');
	if(ename != 'HTTPClassyProbe') {
		document.getElementById("srcport").value = '';
		document.getElementById("port_row").style.display = "none";
	}
}

function actionOK() {
  var topic = g_form.getValue('ecc_queue_topic');
  var ename = g_form.getValue('ecc_queue_name');
  var source = gel('srcip').value;
  var port = gel('srcport').value;
  var agent_name = gel('sys_display.ecc_agent').value;
  var agent_sysId = gel('ecc_agent').value;
  var probe_id = gel('sys_uniqueValue').value;
  var skip_sensor = gel('skip_sensor').checked ? 'true' : 'false';

  var ga = new GlideAjax('MIDServerAjax');
  ga.addParam('sysparm_name','testProbe');
  ga.addParam('sysparm_agent_name',agent_name);
  ga.addParam('sysparm_agent_sysId',agent_sysId);
  ga.addParam('sysparm_probe_id',probe_id);
  ga.addParam('sysparm_topic',topic);
  ga.addParam('sysparm_ename',ename);
  ga.addParam('sysparm_source',source);
  ga.addParam('sysparm_port',port);
  ga.addParam('sysparm_skip_sensor', skip_sensor);
  ga.getXMLWait();
 
  var sys_id = ga.getAnswer();
  GlideDialogWindow.get().destroy();

  var eccQueueURL = "ecc_queue_list.do?sysparm_query=sys_id=" + sys_id + "^ORresponse_to=" + sys_id;

  var gd = new GlideDialogWindow("probe_progress_window");
  gd.setPreference("ecc_queue_id", sys_id);
  gd.setPreference("skip_sensor", skip_sensor);
  gd.setPreference('oncomplete', "self.location = '" + eccQueueURL + "';");
  gd.render();
}
