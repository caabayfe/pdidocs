var cmdb_ci = current.cmdb_ci + '';
if (cmdb_ci) {
        var ipf = new IPAddressFixup(cmdb_ci);
        ipf.fix();
}

//We throw an event here for any customization beyond this point.
gs.eventQueue("discovery.device.post.complete", current, current.sys_id, current.status);
