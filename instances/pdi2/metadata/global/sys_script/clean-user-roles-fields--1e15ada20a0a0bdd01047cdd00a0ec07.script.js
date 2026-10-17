fixUserRolesFields();

function fixUserRolesFields() {
  gs.log("Removing deleted role from role picker fields: " + current.name);
  var role = current.name.toString();
  var roles = new GlideRecord("sys_user_role");
  roles.addQuery("name", role);
  roles.addQuery("sys_id", "!=", current.sys_id);
  roles.query();
  if (roles.next())
    return; // if another role exists with the same name, do nothing
  
  var gr = new GlideRecord('sys_dictionary');
  gr.addQuery('internal_type', 'user_roles');
  gr.query();
  while (gr.next()) {
    if (!GlideTableDescriptor.isValid(gr.name + gr.element))
      continue;

    var rolestable = new GlideMultipleDelete(gr.name + gr.element); // e.g., sys_app_moduleroles
    rolestable.addQuery("value", role);
    rolestable.execute();
  }
}
