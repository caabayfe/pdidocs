var EmptyACLWarningPopupRoleInserter = Class.create();
EmptyACLWarningPopupRoleInserter.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	insertRole: function() {
		var gr = new GlideRecord('sys_security_acl_role');
		gr.initialize();
		gr.setValue('sys_security_acl', this.getParameter('sysparm_aclSysId'));
		gr.setValue('sys_user_role', this.getParameter('sysparm_roleSysId'));
		return gr.insert();
	},
    type: 'EmptyACLWarningPopupRoleInserter'
});
