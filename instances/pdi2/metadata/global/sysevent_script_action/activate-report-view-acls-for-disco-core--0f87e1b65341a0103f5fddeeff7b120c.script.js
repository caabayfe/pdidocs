
var discoCoreAclSysIds = [
	"09e7b89953485410996addeeff7b121e",
	"14ccf0dd53485410996addeeff7b125b",
	"18c2588e5308d410996addeeff7b12b1",
	"449c30dd53485410996addeeff7b127d",
	"6e3350ce5308d410996addeeff7b126c",
	"735afc1d53485410996addeeff7b12e6",
	"764a7c1d53485410996addeeff7b12e8",
	"7750133453881410996addeeff7b1201",
	"a861584e5308d410996addeeff7b1227",
	"a976ac0e5348d410996addeeff7b122f",
	"ad7a705d53485410996addeeff7b127a",
	"d766a80e5348d410996addeeff7b12e7",
	"e7a6785953485410996addeeff7b12b0",
	"e8f2248a5348d410996addeeff7b121b",
	"f0297cd953485410996addeeff7b12b0",
];

var aclGr = new GlideRecord('sys_security_acl');
aclGr.addQuery('sys_id', 'IN', discoCoreAclSysIds);
aclGr.query();
while (aclGr.next()) {
	aclGr.setValue('active', true);
	aclGr.update();
}
