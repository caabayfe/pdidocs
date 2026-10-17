var copyRole = new GlideRecord('sys_embedded_help_role');
copyRole.role = current.sys_id;
copyRole.sys_scope = current.sys_scope;
var order = 1000;
var roleName = current.name;
roleName = roleName.toString().toLowerCase();
if (roleName.includes('admin') && !roleName.includes('itil')) {
	order = 10;
} else if ((roleName.includes('itil') && roleName.includes('admin')) || roleName.includes('manager')) {
	order = 100;
} else if (roleName.includes('itil') && !roleName.includes('admin')) {
	order = 300;
}
copyRole.order = order;
copyRole.setWorkflow(false);
copyRole.insert();
