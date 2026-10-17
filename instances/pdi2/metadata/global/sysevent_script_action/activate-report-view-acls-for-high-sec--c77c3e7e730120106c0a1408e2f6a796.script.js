var SYS_IDs = [
'03e7bc5073f2101006c71408e2f6a7f7', 
'4f32bc9c73b2101006c71408e2f6a764', 
'5102f89c73b2101006c71408e2f6a7d4', 
'510afc9073f2101006c71408e2f6a776', 
'5651b49c73b2101006c71408e2f6a7b7', 
'6cf274dc73b2101006c71408e2f6a72c', 
'6e77385073f2101006c71408e2f6a775', 
'7fa2b0dc73b2101006c71408e2f6a7e4', 
'b328fc5073f2101006c71408e2f6a700', 
'ce3bb8d073f2101006c71408e2f6a775', 
'd23fa45c73b2101006c71408e2f6a7a0', 
'd70b34d073f2101006c71408e2f6a794', 
'daa9f89073f2101006c71408e2f6a76d', 
'e7bf505473b2101006c71408e2f6a71a'                                       
];

gs.log('Activating High Security related ACLs for report_view...');
for (i in SYS_IDs) {
	var sysId = SYS_IDs[i];
	var grACL = new GlideRecord('sys_security_acl');
	grACL.get(sysId);
	grACL.setValue('active', true);
	grACL.update();
}
