// com.snc.core.automation (which is activated by glide OOTB)
// requires com.glideapp.agent so both will be covered here
var midAclSysIds = [
	"1689301d53485410996addeeff7b12eb",
	"1bfcf4dd53485410996addeeff7b1257",
	"52caf45d53485410996addeeff7b1293",
	"707830d953485410996addeeff7b121a",
	"b9f3d8ce5308d410996addeeff7b12d4",
	"f6052cca5348d410996addeeff7b1243",
	"92ea785d53485410996addeeff7b12a2",
	"adaaf05d53485410996addeeff7b12d4",
	"e568648e5348d410996addeeff7b122e",
];

var aclGr = new GlideRecord('sys_security_acl');
aclGr.addQuery('sys_id', 'IN', midAclSysIds);
aclGr.query();
while (aclGr.next()) {
	aclGr.setValue('active', true);
	aclGr.update();
}
