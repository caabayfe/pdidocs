gs.info("Starting FixScript: DeleteDynamicSysUIOverviewHelpACLs.");
var aclSysIds = getReadWriteACLSysIds("sys_ui_overview_help", "allow");
var adminRoleSysId = getRoleSysId("admin");
for (var i = 0; i < aclSysIds.length; i++) {
    aclSysId = aclSysIds[i];
    // Skip any customized ACLs
    if (!isCustomizedACL(aclSysId)) {
    	// Retrieve roles assigned to the ACL
	var gr = new GlideRecord("sys_security_acl_role");
	gr.addQuery("sys_security_acl", aclSysId);
	gr.query();
	
	// Delete the ACL if it has only one assigned admin role
	// Deleting the ACL will also cascade and delete the corresponding admin role record
	if (gr.getRowCount() == 1) {
		gr.next();
		if (adminRoleSysId && gr.getValue("sys_user_role") == adminRoleSysId)
			deleteACL(aclSysId);
        }
    }
}
gs.info("FixScript complete: DeleteDynamicSysUIOverviewHelpACLs.")

/**
 * Returns the sys_ids of the read/write ACLs with the specified aclName and decType.
 */
function getReadWriteACLSysIds(aclName, decType) {
    var aclSysIds =[];
    var gr = new GlideRecord("sys_security_acl");
    gr.addQuery("name", aclName);
    gr.addQuery("operation","IN", ["read","write"]);
    gr.addQuery("decision_type", decType);
    gr.query();

    while(gr.next())
        aclSysIds.push(gr.getUniqueValue());

    return aclSysIds;
}

/**
 * Returns the sys_id of the user role with the specified roleName. If the role does not exist, it returns null.
 */
function getRoleSysId(roleName) {
    var gr = new GlideRecord("sys_user_role");
    gr.addQuery("name", roleName);
    gr.query();
    return (gr.next())? gr.getUniqueValue(): null;
}

/**
 * Returns true if the acl with aclSysId is modified by the user
 */
function isCustomizedACL(aclSysId) {
    var gr = new GlideRecord("sys_update_xml");
    gr.addQuery("name", "sys_security_acl_" + aclSysId);
    gr.query();
    return gr.hasNext();
}

/**
 * Delete the acl specified by aclSysId
 */
function deleteACL(aclSysId) {
    var gr = new GlideRecord("sys_security_acl");
    if (gr.get(aclSysId)) {
		gr.deleteRecord();
		gs.info("Deleting ACL with sys_id: " + aclSysId );
	} else
		gs.info("ACL with sys_id: " + aclSysId + " is not available on the instance");
}
