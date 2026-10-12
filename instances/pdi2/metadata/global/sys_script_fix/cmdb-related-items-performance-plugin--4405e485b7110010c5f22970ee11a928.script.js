//Check if CMDB Related Items Performance Accelerator not activated yet
var start = new Date().getTime();
gs.info("CMDB Related Items Performance Accelerator activation: started.");
if (!new GlidePluginManager().isRegistered("com.snc.cmdb.perf.acc")){
    if(isValidToUpgrade("cmdb_fc_initiator") && isValidToUpgrade("cmdb_fc_target") && isValidToUpgrade("cmdb_print_queue_instance") && isValidToUpgrade("cmdb_software_instance") && isValidToUpgrade("samp_client_access") && isValidToUpgrade("samp_oracle_options")){
        new GlidePluginManager().registerPlugin("com.snc.cmdb.relateditems.perf.acc");
        gs.info("CMDB Related Items Performance Accelerator activated");
    }
}
var end = new Date().getTime();
var duration = end - start;
gs.info("CMDB Related Items Performance Accelerator activation took " + duration + " ms.");
//Return true/false. Check is table valid to upgrade
function isValidToUpgrade(tableName) {
	var maxSize = GlideProperties.getInt("cmdb.plugin_activation.table_max_size", 5000000);
    var count = new GlideAggregate(tableName);
    //if isValid() == false - the table doesn't exists.
    if(!count.isValid()){
        gs.info("CMDB Related Items Performance Accelerator activation: table " + tableName + " doesn't exists");
        return false;
    }
    count.setWorkflow(false);
    count.addAggregate('COUNT');
    count.query();
    if(count.next()){
        var tableSize = count.getAggregate('COUNT');
        if(tableSize >= maxSize){
            gs.info("CMDB Related Items Performance Accelerator activation: table " + tableName + " has size more than " + maxSize);
            return false;
        }
    }
    return true;
}
