function transform(input) {
    var tableName = 'sn_um_lastclone_summary';

    // Delete all records from the table
    var grDelete = new GlideRecord(tableName);
    grDelete.query();
    grDelete.deleteMultiple();
	
    var worker = new GlideScriptedHierarchicalWorker();
    worker.setProgressName("Upgrade Management - Get Current Instance Last Clone Details"); // The name of the progress bar
    worker.setScriptIncludeName("sn_upgrade_mgmt.UCAsyncFunctions"); //The name of the Script Include which contains your long-running function
    worker.setScriptIncludeMethod("getLastCloneSummary"); //The name of the method in your script include you want to run
    // worker.putMethodArg("parameterName","parameteValue"); //Pass the method paramete here
    worker.setSourceTable('sn_um_lastclone_summary');
    worker.setBackground(true); // This is required for the process to be offloaded from the server,
    worker.start(); //Invokes the method and kicks off the whole thing
    return worker.getProgressID(); // Returns the sys_id of the progress worker;  
}
