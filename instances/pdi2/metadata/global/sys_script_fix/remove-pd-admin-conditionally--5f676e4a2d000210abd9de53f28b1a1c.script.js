var PD_ADMIN_ID = 'a096ad0877230010612c1b1ad9106155';
var PD_PLAYBOOK_PD_ADMIN_ID = '40574835a3800210bfba1aaaf31e6117';
// 1. Give all users with 'pd_admin' role the new role 'playbook.admin'
var grExistingUserHasRole = new GlideRecord('sys_user_has_role');
grExistingUserHasRole.addQuery('role', PD_ADMIN_ID);
grExistingUserHasRole.query();
while (grExistingUserHasRole.next()) {
    var userId = grExistingUserHasRole.getValue('user');
    if (!userId) continue;
    var grNewUserHasRole = new GlideRecord('sys_user_has_role');
    grNewUserHasRole.setValue('user', userId);
    grNewUserHasRole.setValue('role', PD_PLAYBOOK_PD_ADMIN_ID);
    grNewUserHasRole.setValue('state', 'active');
    grNewUserHasRole.insert();
}
// 2. If Pattern Designer is not installed, remove 'pd_admin' role from all users
// and delete the role record
if (!GlidePluginManager.isActive('com.sn_pattern_designer')) {
    grExistingUserHasRole = new GlideRecord('sys_user_has_role');
    grExistingUserHasRole.addQuery('role', PD_ADMIN_ID);
    grExistingUserHasRole.query();
    if (grExistingUserHasRole.hasNext())
        grExistingUserHasRole.deleteMultiple();
    var grPDAdminUserRole = new GlideRecord('sys_user_role');
    if (grPDAdminUserRole.get(PD_ADMIN_ID))
        grPDAdminUserRole.deleteRecord();
}
