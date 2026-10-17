var portProbeGr = new GlideRecord('discovery_port_probe');
portProbeGr.get('name', 'esxi');
var esxiPortProbeSysId = portProbeGr.getValue('sys_id');
var gr = new GlideRecord('discovery_function_def');
gr.get('name', 'ALL');
var portProbesSysId = gr.getValue('functionality') + ',' + esxiPortProbeSysId;
gr.setValue('functionality', portProbesSysId);
gr.update();
