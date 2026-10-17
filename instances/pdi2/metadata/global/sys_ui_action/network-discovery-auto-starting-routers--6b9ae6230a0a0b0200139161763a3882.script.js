function addRouter(router) {
    // first make a range...
    var rangeGR = new GlideRecord('discovery_range');
    rangeGR.name = 'Starting Router: ' + router;
    rangeGR.active = true;
    rangeGR.insert();
    
    // then make an m2m record to connect it to our schedule...
    var m2mGR = new GlideRecord('discovery_schedule_range');
    m2mGR.dscheduler = current.sys_id;
    m2mGR.range = rangeGR.sys_id;
    m2mGR.insert();
    
    // then make an IP Address List range item that points to our range set...
    var rangeItemGR = new GlideRecord('discovery_range_item');
    rangeItemGR.name = 'Starting Router: ' + router;
    rangeItemGR.type = 'IP Address List';
    rangeItemGR.active = true;
    rangeItemGR.parent = rangeGR.sys_id;
    rangeItemGR.insert();
    
    // and finally, make an IP address entry that points to our range item...
    var ipsGR = new GlideRecord('discovery_range_item_ip');
    ipsGR.ip_address = router;
    ipsGR.item_parent = rangeItemGR.sys_id;
    ipsGR.insert();
}

function ensureSeedRouter(router) {
    var rangeGR = new GlideRecord('discovery_range');
    var m2mGR = new GlideRecord('discovery_schedule_range');
    m2mGR.addQuery('dscheduler', current.sys_id);
    m2mGR.query();
    var found = false;
    while (!found && m2mGR.next()) {
        rangeGR.get(m2mGR.range);
        found = (rangeGR.name == 'Starting Router: ' + router);
    }
    if (!found) 
        addRouter(router);
}

var agentGR = new GlideRecord('ecc_agent');
agentGR.addQuery('status', 'Up');
agentGR.addActiveQuery();
agentGR.query();
while (agentGR.next())
    ensureSeedRouter(agentGR.router);
var url = 'discovery_schedule.do?sys_id=' + current.sys_id;
action.setRedirectURL(url);
