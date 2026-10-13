function setAllToReady() {
    var ga = new GlideAjax('DiscoveryAjax');
    ga.addParam('sysparm_name','setAllToReady');
    ga.getXMLWait();
    self.location = 'cmdb_ci_ip_network_list.do';
}
