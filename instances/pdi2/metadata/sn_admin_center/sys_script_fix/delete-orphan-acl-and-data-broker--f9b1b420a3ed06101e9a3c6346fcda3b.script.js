/*
Delete Orphan ACL
*/
var grAcl = new GlideRecord('sys_security_acl');
grAcl.addQuery('sys_id', 'f8a02f425b66011011ca51d11581c7f3');
grAcl.query();

if (grAcl.next()) {
	gs.info('Deleting orphan ACL: ' + grAcl.getValue('sys_id'));
	grAcl.deleteRecord();
} else {
	gs.warn('Unable to find ACL record ' + grAcl.getValue('sys_id') + ' on sys_security_acl table.');
}


/*
Delete Orphan data broker
*/
var grDB = new GlideRecord('sys_ux_data_broker_transform');
grDB.addQuery('sys_id', 'c1e9245e5ba6011011ca51d11581c73d');
grDB.query();

if (grDB.next()) {
	gs.info('Deleting orphan data broker: ' + grDB.getValue('sys_id'));
	grDB.deleteRecord();
} else {
	gs.warn('Unable to find data broker record ' + grDB.getValue('sys_id') + ' on sys_ux_data_broker_transform table.');
}
