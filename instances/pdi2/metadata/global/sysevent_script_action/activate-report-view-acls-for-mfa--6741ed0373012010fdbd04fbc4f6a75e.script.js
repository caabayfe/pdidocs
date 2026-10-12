var aclGR = new GlideRecord('sys_security_acl');
aclGR.addQuery('sys_id', 'IN', '43b8705173231010fdbd04fbc4f6a7d1,b397381173231010fdbd04fbc4f6a7c7,d929b45173231010fdbd04fbc4f6a737,f679785173231010fdbd04fbc4f6a7f7');
aclGR.setValue('active', true);
aclGR.updateMultiple();
