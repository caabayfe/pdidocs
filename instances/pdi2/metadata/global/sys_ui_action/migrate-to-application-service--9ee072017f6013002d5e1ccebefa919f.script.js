var bsManager = new SNC.BusinessServiceManager();

var name = current.name;
var res = bsManager.migrateManualToITService(current.sys_id);
if (res == true){
	gs.addInfoMessage(gs.getMessage("Service migrated successfully from Manual Service to Application Service: {0}", name));
} 
else {
	gs.addErrorMessage(gs.getMessage("Error migrating Manual Service '{0}': {1}", [name, bsManager.error]));
}
