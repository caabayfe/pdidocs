answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);

if (answer != null && current.getLastErrorMessage() == null) {
  //gs.addInfoMessage("Table '" + current.label + "' (" + current.name + ") created");

  // add new table to custom tables list
  var appModule = new GlideApplicationModule();
  appModule.setURL("v_ws_editor.do?sysparm_query=name=" + current.name);
  appModule.setIcon("images/icons/web_services_mapped.gifx");
  appModule.setModuleLabel(current.label);
  appModule.setModuleHint(gs.getMessage('User customized web service'));
  appModule.setCreateApplication(false);
  appModule.setCreateModule(true);

  
  // activate separator if needed
  var sgr = new GlideRecord("sys_app_module");
  sgr.addQuery("link_type", "SEPARATOR");
  sgr.addQuery("order", "1049");
  sgr.addQuery("active", "false");
  sgr.query();
  if (sgr.next()) {
    sgr.active = "true";
    sgr.update();
  }

  if (current.application_name.nil()) {
    appModule.setModuleOrder(1050); // always 1050
    appModule.setApplicationName("system_web_services");
  } else {
    appModule.setApplicationName(current.application_name);
    appModule.setIcon(current.module_icon);
  }

  appModule.create();

  if (current.copy_fields == true && !current.target_table.nil()) {
    new ImportSetUtil().copyFields(current.name, current.target_table, current.extends_table);
  }

  if (current.create_transform_map) {
    gs.addInfoMessage("Please create Transform Map");
    gs.setRedirect("sys_transform_map.do?sys_id=-1&sysparm_query=source_table=" + current.name + "^target_table=" + current.target_table + "^name=" + current.label);
  } else {
    gs.setRedirect("v_ws_editor.do?sysparm_query=name=" + current.name);
  }
}
