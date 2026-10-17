var macro = new GlideRecord("sys_ui_macro");
var name = current.formatter.toString().split(".")[0]
macro.addQuery("name", name);
macro.query();
if (macro.next()) {
  if (macro.canRead()) {
    var id = macro.sys_id;
    action.setRedirectURL("sys_ui_macro.do?sys_id=" + id);
    action.setReturnURL(current);
  } else {
    gs.addInfoMessage(gs.getMessage("Security constraints prevent access to UI Macro"));
    action.setRedirectURL(current);
  }
} else {
  gs.addInfoMessage(gs.getMessage("UI Macro: {0} does not exist",name));
  action.setRedirectURL(current);
}
current.update();
