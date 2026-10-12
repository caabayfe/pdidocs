/*
These are new ACLs for Incident,Problem and Change table. Activating them can impact custom ACLs on upgrade instances.
'plugin.activated' event is used so that only zboot and first activation instances can have new ACLs as active.
'plugin.upgraded' event should not be used.
*/
if (event.parm1 == 'com.snc.itsm.roles') {
	new ITSMBSCommentsWriteHelper().updateAllBSCommentsWriteACLs();
} else if (event.parm1 == 'com.snc.incident.mim') {
	//plugin.activated is triggered before ACL files from other plugin's if folder are loaded.
	//script needs to run after.
	new ITSMBSCommentsWriteHelper().insertMimACLModifyTrigger();
}
