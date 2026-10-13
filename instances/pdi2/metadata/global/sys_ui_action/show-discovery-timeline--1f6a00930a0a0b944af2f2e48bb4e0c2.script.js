function showDiscoveryTimeline() {
    var sysId = $F('sys_uniqueValue');

    if (!validCondition(sysId))
        return;

    var url = new GlideURL('show_schedule_page.do');
    url.addParam('sysparm_page_schedule_type', 'discovery_probe_sensor');
    
    // Add only the client options to prevent another AJAX call
    url.addParam('sysparm_timeline_agent_correlator', sysId);

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();

}

function validCondition(sysId){
    ga = new GlideAjax('DiscoveryAjax');
    ga.addParam('sysparm_name','countECCRecords');
    ga.addParam('sysparm_sys_id', sysId);
    ga.getXMLWait();
    var answer = ga.getAnswer();
    var parts = answer.split(',');
    var count = parts[0] - 0;
    var limit = parts[1] - 0;

    if (count > limit) {
        alert("The number of ECC queue entries (" + count + 
              ") in this discovery exceeds the allowable limit (" + limit + 
              "). The limit is set by the property glide.discovery.timeline.max_entries");
        return false;
    }

    return true;
}
