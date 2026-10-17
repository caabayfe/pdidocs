function onChange(control, oldValue, newValue, isLoading) {
  var sourceOptions = gel('delegate_roles_roles_select_1').options;
  // Remove all options from the Selected list
  var selectedIds = new Array();
  var index = 0;
  for (var i = 0; i < sourceOptions.length; i++) {
    if (sourceOptions[i].value != "--None--") // don't move the empty label
      selectedIds[index++] = i;
  }
  if (selectedIds.length > 0) {
    var s0 = gel('delegate_roles_roles_select_0');
    moveSelectedOptions(selectedIds, gel('delegate_roles_roles_select_1'), s0, '--None--', null, '--None--');
    sortSelect(s0);
    s0.selectedIndex = -1;
  }

  if (newValue != "") {
    var ga = new GlideAjax('DelegateRolesAjax');
    ga.addParam('sysparm_name','getDelegateUserRoles');
    ga.addParam('sysparm_user', g_form.getValue("delegate_roles_user"));
    ga.addParam('sysparm_group', g_form.getValue("delegate_roles_group"));
    ga.getXML(populateDelegatedRoles);
    g_form.setDisplay("delegate_roles_roles", true);
} else
    g_form.setDisplay("delegate_roles_roles", false);
}
