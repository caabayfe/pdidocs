// volumes -> controllers
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('parent', parent.sys_id);
cr.addQuery('child.sys_class_name', 'cmdb_ci_storage_controller');
cr.query();

var ids = [];
while (cr.next())
	ids.push(''+cr.child);

current.addQuery('sys_id', ids);
