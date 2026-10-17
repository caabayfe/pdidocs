var discovery_sources_str = GlideProperties.get('sm.dedup_tracker.discovery_sources');

if (!!discovery_sources_str) {

    var dupUtils = new CMDBDuplicateTaskUtils();

    var discovery_sources_arr = discovery_sources_str.split(",");
    discovery_dict = {};

    for (var indx = 0; indx < discovery_sources_arr.length ; indx++) {
        discovery_dict[ discovery_sources_arr[indx] ] = 1;
    }
    
    var gr = new GlideRecord("application_on_servers");
    gr.orderBy("hosts_child");
    gr.orderBy("appl_running_process_command");
    gr.orderBy("appl_running_process_key_parameters");
    gr.orderBy("appl_tcp_port");
    gr.orderBy("appl_discovery_source");
         
    gr.query();

    var prevRunningProcessCommand       = '';
    var prevRunningProcessKeyParameters = '';
    var prevDiscoverySource             = '';
    var prevTcpPort                     = '';
    var prevClass                       = '';
    var prevHost                        = '';
    var prevSysId                       = '';
    
    
    var currRunningProcessCommand       = '';
    var currRunningProcessKeyParameters = '';
    var currDiscoverySource             = '';
    var currTcpPort                     = '';
    var currClass                       = '';
    var currHost                        = '';
    var currSysId                       = '';
    
    
    while(gr.next())
    {
        //update current iteration variables
        currRunningProcessCommand       = gr.getValue("appl_running_process_command");
        currRunningProcessKeyParameters = gr.getValue("appl_running_process_key_parameters");
        currDiscoverySource             = gr.getValue("appl_discovery_source");
        currTcpPort                     = gr.getValue("appl_tcp_port");
        currClass                       = gr.getValue("appl_sys_class_name");
        currHost                        = gr.getValue("hosts_child");
        currSysId                       = gr.getValue("appl_sys_id");

        var dupStr = currSysId;
        dupStr = dupStr + ",";
        dupStr = dupStr + prevSysId;

        var sources = currDiscoverySource;
        sources = sources + ",";
        sources = sources + prevDiscoverySource;
    
        if(isSameValue(currHost,prevHost)) {
            var sameProcess =  isSameValue(currRunningProcessCommand,prevRunningProcessCommand) && isSameValue(currRunningProcessKeyParameters,prevRunningProcessKeyParameters) ;
            var sameTcpPort =  isSameValue(currTcpPort,prevTcpPort);
    
            var dupCandidate = sameProcess || sameTcpPort;
    
            if ( dupCandidate && (currClass === "cmdb_ci_appl" || prevClass === "cmdb_ci_appl" ) ) {
                gs.log("trivial duplication found - candidate to report to CMDB de-dup mechanism");

                if( discovery_dict[currDiscoverySource] != undefined || discovery_dict[prevDiscoverySource] != undefined ) {
                    gs.info("matching duplication (" + dupStr + ") that may be reported for tracked discovery source (" + sources + ")");
                    dupUtils.createDuplicateTask(dupStr);
                }else {
                    gs.warn("matching duplication (" + dupStr + ") that WILL NOT be reported since NO tracked discovery source (" + sources + ")");
                }


            }else {
                gs.log("non trivial duplication found cannot report to cmdb since duplication source is not known");
            }
        }
    
    
        gs.log(gr.getValue("appl_name") + " : " + currRunningProcessCommand + " : " + currRunningProcessKeyParameters + " : " + currDiscoverySource + " : " + currTcpPort + " : " + currClass + " : " + currHost + " : " + currSysId);
    
        //update next iteration previous values
        prevRunningProcessCommand       = currRunningProcessCommand;
        prevRunningProcessKeyParameters = currRunningProcessKeyParameters;
        prevDiscoverySource             = currDiscoverySource;
        prevTcpPort                     = currTcpPort;
        prevClass                       = currClass;
        prevHost                        = currHost;
        prevSysId                       = currSysId;
    
    
    }

}

//Utility macro to validate prev and current value exist and are equal
function isSameValue(prev,curr) {
    return (!!prev && !!curr && prev === curr);
}
