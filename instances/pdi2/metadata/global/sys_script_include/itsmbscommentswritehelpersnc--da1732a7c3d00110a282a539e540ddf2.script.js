var ITSMBSCommentsWriteHelperSNC = Class.create();

ITSMBSCommentsWriteHelperSNC.prototype = {
	initialize: function() {

	},

	bsCommentsWriteACLActive: function() {
		var bsCommWriteACLIdsExcludeMim = [
			'1d0910cdc3023010a282a539e540dd13',
			'64263c16c3e13010a282a539e540dd86',
			'91b7ec2cc3313010a282a539e540dd37',
			'92b7f096c3e13010a282a539e540dd4e',
			'c1b5fcd2c3e13010a282a539e540ddc6',
			'080a301ac3e13010a282a539e540dd1d',
			'1221ba62c3223010a282a539e540dd7e',
			'38f2bea2c3223010a282a539e540ddb4',
			'8479bc96c3e13010a282a539e540ddb0',
			'0c44f492c3e13010a282a539e540ddf1',
			'a1150faec3223010a282a539e540dd90',
			'b9193267c3333010a282a539e540dd19',
			'c941467fc3333010a282a539e540dded',
			'23a1c2bfc3333010a282a539e540dd7b',
			'7a693667c3333010a282a539e540dd2c',
			'19d83e27c3333010a282a539e540ddae',
			'925ff5fbc3333010a282a539e540dd6c'
		];

		var aclCheckGR = new GlideRecord('sys_security_acl');
		aclCheckGR.addQuery('sys_id', 'IN', bsCommWriteACLIdsExcludeMim);
		aclCheckGR.addQuery('active', true);
		aclCheckGR.query();
		return aclCheckGR.hasNext();
	},

	updateAllBSCommentsWriteACLs: function() {
		var bsCommentsWriteACLIds = [
			'1d0910cdc3023010a282a539e540dd13',
			'64263c16c3e13010a282a539e540dd86',
			'91b7ec2cc3313010a282a539e540dd37',
			'92b7f096c3e13010a282a539e540dd4e',
			'c1b5fcd2c3e13010a282a539e540ddc6',
			'080a301ac3e13010a282a539e540dd1d',
			'1221ba62c3223010a282a539e540dd7e',
			'38f2bea2c3223010a282a539e540ddb4',
			'8479bc96c3e13010a282a539e540ddb0',
			'0c44f492c3e13010a282a539e540ddf1',
			'a1150faec3223010a282a539e540dd90',
			'b9193267c3333010a282a539e540dd19',
			'c941467fc3333010a282a539e540dded',
			'23a1c2bfc3333010a282a539e540dd7b',
			'7a693667c3333010a282a539e540dd2c',
			'19d83e27c3333010a282a539e540ddae',
			'925ff5fbc3333010a282a539e540dd6c',
			'c2fe76e5c3100110a282a539e540dd64',
			'4cdeb2e5c3100110a282a539e540dd2e'
		];

		var aclGR = new GlideRecord('sys_security_acl');
		aclGR.addQuery('sys_id', 'IN', bsCommentsWriteACLIds);
		aclGR.setValue('active', true);
		aclGR.updateMultiple();

		var toBeDeactivatedACLIds = [
			'f6af81544657629200f6a10b43112aa6',
			'fb2ac596c0a8ce0100c1eabe1095f34f',
			'0527cdceb7522010eeafbc16de11a970',
			'06b6e48ab7122010eeafbc16de11a97b'
		];

		var aclToDeactivateGR = new GlideRecord('sys_security_acl');
		aclToDeactivateGR.addQuery('sys_id', 'IN', toBeDeactivatedACLIds);
		aclToDeactivateGR.setValue('active', false);
		aclToDeactivateGR.updateMultiple();
	},

	updateMimBSCommentsWriteACLs: function() {
		var mimActivateACLIds = [
			'c2fe76e5c3100110a282a539e540dd64',
			'4cdeb2e5c3100110a282a539e540dd2e'
		];

		var mimAclActivateGR = new GlideRecord('sys_security_acl');
		mimAclActivateGR.addQuery('sys_id', 'IN', mimActivateACLIds);
		mimAclActivateGR.setValue('active', true);
		mimAclActivateGR.updateMultiple();

		var mimACLDeactivateIds = [
			'06b6e48ab7122010eeafbc16de11a97b'
		];

		var mimAclToDeactivateGR = new GlideRecord('sys_security_acl');
		mimAclToDeactivateGR.addQuery('sys_id', 'IN', mimACLDeactivateIds);
		mimAclToDeactivateGR.setValue('active', false);
		mimAclToDeactivateGR.updateMultiple();
	},

	insertMimACLModifyTrigger: function() {
		if (!this.bsCommentsWriteACLActive())
			return;

		var tGR = new GlideRecord('sys_trigger');
		tGR.name = 'ITSM Business Comments Write ACL for mim';
		var gdt = new GlideDateTime();
		gdt.addSeconds(5 * 60);
		tGR.next_action = gdt;
		tGR.script = "new ITSMBSCommentsWriteHelper().updateMimBSCommentsWriteACLs();";
		tGR.job_id.setDisplayValue('RunScriptJob');
		tGR.trigger_type = 0;
		tGR.insert();
	},

	type: 'ITSMBSCommentsWriteHelperSNC'
};
