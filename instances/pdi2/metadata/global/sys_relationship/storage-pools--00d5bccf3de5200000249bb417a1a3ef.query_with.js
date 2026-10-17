// server -> pools
var pr = new GlideRecord('cmdb_rel_ci');
pr.addQuery('child', parent.sys_id);
pr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_pool');
pr.query();

var ids = [];
while (pr.next())
    ids.push(''+pr.parent);

current.addQuery('sys_id', ids);
