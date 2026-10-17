// volume -> pools
var pr = new GlideRecord('cmdb_rel_ci');
pr.addQuery('child.sys_class_name', 'cmdb_ci_storage_pool');
pr.addQuery('parent', parent.sys_id);
pr.query();

var ids = [];
while (pr.next())
    ids.push(''+pr.child);

current.addQuery('sys_id', ids);
