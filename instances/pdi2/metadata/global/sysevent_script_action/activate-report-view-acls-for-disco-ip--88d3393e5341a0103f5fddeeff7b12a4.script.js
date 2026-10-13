var discoIpAclSysIds = [
	"12f8b8d953485410996addeeff7b12f0",
	"31d8f4d953485410996addeeff7b1271",
	"40287c9953485410996addeeff7b12aa",
	"dd7490025348d410996addeeff7b12fc",
	"f7a874d953485410996addeeff7b1277"
];

var aclGr = new GlideRecord('sys_security_acl');
aclGr.addQuery('sys_id', 'IN', discoIpAclSysIds);
aclGr.query();
while (aclGr.next()) {
	aclGr.setValue('active', true);
	aclGr.update();
}
