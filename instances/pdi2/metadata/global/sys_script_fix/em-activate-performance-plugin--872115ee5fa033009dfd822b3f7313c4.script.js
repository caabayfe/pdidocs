//Check if Event Management Performance Accelerator not activated yet
var start = new Date().getTime();
gs.info("EM Performance Accelerator activation: started.");
if (!new GlidePluginManager().isRegistered("com.glideapp.itom.snac.perf.acc")){
    if(isValidToUpgrade("em_alert_history") && isValidToUpgrade("em_impact_status")){
        new GlidePluginManager().registerPlugin("com.glideapp.itom.snac.perf.acc");
        gs.info("EM Performance Accelerator activated");
    }
}
var end = new Date().getTime();
var duration = end - start;
gs.info("EM Performance Accelerator activation took " + duration + " ms.");


//Return true/false. Check is table valid to upgrade
function isValidToUpgrade(tableName) {
	var maxSize = GlideProperties.getInt("evt_mgmt.plugin_activation.table_max_size", 5000000);

    var count = new GlideAggregate(tableName);
    //if isValid() == false - the table doesn't exists.
    if(!count.isValid()){
        gs.info("EM Performance Accelerator activation: table " + tableName + " doesn't exists");
        return false;
    }

    count.setWorkflow(false);
    count.addAggregate('COUNT');
    count.query();
    if(count.next()){
        var tableSize = count.getAggregate('COUNT');
        if(tableSize >= maxSize){
            gs.info("EM Performance Accelerator activation: table " + tableName + " has size more than " + maxSize);
            return false;
        }
    }
    return true;
}
