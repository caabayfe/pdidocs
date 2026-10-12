gs.print('dropping table ' + current.name);
gs.dropTable(current.name);
    
gs.print('removing application modules ' + current.name);
var am = new GlideRecord('sys_app_module');
am.addQuery('query', "v_ws_editor.do?sysparm_query=name=" + current.name);
am.query();
while (am.next()) {
  am.deleteRecord();
}
