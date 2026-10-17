// server -> pools
var pr = new GlideRecord('cmdb_rel_ci');
pr.addQuery('child', parent.sys_id);
pr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_pool');
pr.query();
var ids = [];
while (pr.next())
    ids.push(''+pr.parent);

// pools -> volumes
var vr = new GlideRecord('cmdb_rel_ci');
vr.addQuery('child', ids);
vr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_volume');
vr.query();

ids = [];
while (vr.next())
    ids.push(''+vr.parent);

// volumes -> controllers
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('parent', ids);
cr.addQuery('child.sys_class_name', 'cmdb_ci_storage_controller');
cr.query();

ids = [];
while (cr.next())
    ids.push(''+cr.parent);

current.addQuery('sys_id', ids);
