var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '219b389173231010616ca9843cf6a780,4088b05173231010616ca9843cf6a77a');
aclGR.setValue('active', true);
aclGR.updateMultiple();
