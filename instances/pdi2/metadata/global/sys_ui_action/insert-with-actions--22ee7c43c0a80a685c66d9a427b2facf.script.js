doInsertWithActions();
function doInsertWithActions() {
  var oldid = current.sys_id.toString();
  var saveMe = current;
  var id = current.insert();
  var actions = new GlideRecord('sys_ui_policy_action');
  actions.addQuery('ui_policy',oldid);
  actions.query();
  while (actions.next()) {
    actions.ui_policy = id;
    actions.table = current.table;
    actions.insert();
  }
  action.setRedirectURL(saveMe);
}
