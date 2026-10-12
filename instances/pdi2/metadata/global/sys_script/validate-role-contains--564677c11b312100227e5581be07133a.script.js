var userRoleGr = new GlideRecord('sys_user_role');
userRoleGr.addQuery('sys_id', current.contains);
userRoleGr.addQuery('name', 'maint');
userRoleGr.query();
if (userRoleGr.hasNext()) {
   current.setAbortAction(true);
   gs.addErrorMessage(gs.getMessage('Can not assign maint as a contained role'));
}

var rt = new RoleRecursiveTester('sys_user_role_contains', 'role', 'contains');
if (rt.isRecursive(current)) {
   current.setAbortAction(true);
   gs.addErrorMessage(gs.getMessage('Aborting the operation due to the roles cyclicity!'));
}
