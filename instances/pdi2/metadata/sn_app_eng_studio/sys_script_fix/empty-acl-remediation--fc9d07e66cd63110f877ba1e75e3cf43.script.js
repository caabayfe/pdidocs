var writeAuditOOBACLList = ['c444706d4f5031103e4c2044dd72e04f','a95f8825105cb150f877390914077ec2','64b948e9101cb150f877390914077e90','22cf6fd510d8b150f877390914077e86'];
	empty_acl_fix(writeAuditOOBACLList);

	function empty_acl_fix(writeAuditOOBACLList) {
		gs.info("*** Started deletion of ACL write audit customizations for AES and Collaboration ACLS ***", "Empty_ACL_customization_deletion_FS");
		new global.AccessControlUtils().deleteCustomerUpdatesForAuditedEmptyACLs(writeAuditOOBACLList);
		gs.info("*** Completed deletion of ACL write audit customizations for AES and Collaboration ACLS ***", "Empty_ACL_customization_deletion_FS");
	}
