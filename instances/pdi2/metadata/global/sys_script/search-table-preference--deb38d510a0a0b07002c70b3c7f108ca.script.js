var pref = new GlideRecord('sys_user_preference');
pref.addQuery('name','ts.table.' + current.sys_id);
pref.addQuery('system','true');
pref.query();
if (!pref.next()) {
  pref.initialize();
  pref.name = 'ts.table.' + current.sys_id;
  pref.system = 'true';
  pref.value = current.searched;
  pref.insert();
} else {
  pref.value = current.searched;
  pref.update();
}
gs.getUser().setPreferencesLoaded(false);
