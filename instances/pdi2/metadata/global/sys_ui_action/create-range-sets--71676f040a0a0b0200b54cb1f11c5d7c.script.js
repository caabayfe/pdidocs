function createRangeSets() {
    var ga = new GlideAjax('DiscoveryAjax');
    ga.addParam('sysparm_name','createRangesFromNetworkDiscovery');
    ga.getXMLWait();
    if (ga.getAnswer() !== 'true') {
        alert("No qualified IP Networks available to be converted to range sets.");
        return;   
    }

	self.location = 'discovery_range_list.do';
}
