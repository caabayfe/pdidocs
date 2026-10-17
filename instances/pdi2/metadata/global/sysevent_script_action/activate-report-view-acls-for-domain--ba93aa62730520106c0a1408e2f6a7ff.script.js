
var SYS_IDs = [
'0c35341073f2101006c71408e2f6a70a',
'20c5f81073f2101006c71408e2f6a7de',
'6955741073f2101006c71408e2f6a7e0',
'8af53c1073f2101006c71408e2f6a7dc',
'c923b4dc73b2101006c71408e2f6a7d7',
'cd76b05073f2101006c71408e2f6a7cf',
'f7c4f01073f2101006c71408e2f6a74b',
'fef4741073f2101006c71408e2f6a7b9'
];

gs.log('Activating Domain related ACLs for report_view...');
for (i in SYS_IDs) {
	var sysId = SYS_IDs[i];
	var grACL = new GlideRecord('sys_security_acl');
	grACL.get(sysId);
	grACL.setValue('active', true);
	grACL.update();
}
