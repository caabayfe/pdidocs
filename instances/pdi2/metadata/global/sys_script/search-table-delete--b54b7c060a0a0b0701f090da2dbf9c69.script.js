var pref = new GlideRecord('sys_user_preference');
pref.addQuery('name','CONTAINS',current.sys_id);
pref.deleteMultiple();
