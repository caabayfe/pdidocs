if (GlidePluginManager.isActive('sn_disco_certmgmt')) {
    var portProbeGr = new GlideRecord('discovery_port_probe');
    portProbeGr.get('name', 'tls_ssl_certs');
    var tlsPortProbeSysId = portProbeGr.getValue('sys_id');
    var gr = new GlideRecord('discovery_function_def');
    if(gr.get('name', 'ALL')){
        var portProbesSysId = gr.getValue('functionality');
        if (portProbesSysId.indexOf(tlsPortProbeSysId) == -1){
            portProbesSysId = portProbesSysId + ',' + tlsPortProbeSysId;
            gr.setValue('functionality', portProbesSysId);
            gr.update();
      }
  }
}
