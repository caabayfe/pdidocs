// port -> controllers
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('child.sys_class_name', 'cmdb_ci_storage_server');
cr.addQuery('parent', parent.sys_id);
cr.query();

var ids = [];
while (cr.next())
    ids.push(''+cr.child);

current.addQuery('sys_id', ids);
