var all_roles = [];
var userHasRoleGR = new GlideRecord('sys_user_has_role');
userHasRoleGR.addQuery('user',user_id);
userHasRoleGR.query();
while(userHasRoleGR.next())
all_roles.push(userHasRoleGR.getDisplayValue('role'));
answer = GlidePluginManager.isActive('com.glide.explicit_roles') ? all_roles.includes ('snc_internal') && all_roles.length >=2:all_roles.length >=1;
