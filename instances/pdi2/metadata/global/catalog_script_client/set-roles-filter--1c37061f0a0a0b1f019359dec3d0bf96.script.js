function onChange(control, oldValue, newValue, isLoading) {

   g_form.setValue("delegate_roles_user", "");

   var group = g_form.getValue("delegate_roles_group");
   var answer = 'sys_idINjavascript:getDelegatableRoles("' + group + '")';
   delegate_roles_rolesg_filter.reset();
   delegate_roles_rolesg_filter.setQuery(answer);
   delegate_roles_rolesacRequest(null);
}
