// pool -> volumes
var vr = new GlideRecord('cmdb_rel_ci');
vr.addQuery('parent', parent.sys_id);
vr.addQuery('child.sys_class_name', 'cmdb_ci_storage_volume');
vr.query();
var ids = [];
while (vr.next())
    ids.push('' + vr.child);

// volumes -> controllers
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('parent', ids);
cr.addQuery('child.sys_class_name', 'cmdb_ci_storage_controller');
cr.query();
ids = [];
while (cr.next())
    ids.push('' + cr.child);

// controllers -> ports
var pr = new GlideRecord('cmdb_rel_ci');
pr.addQuery('parent', ids);
pr.addQuery('child.sys_class_name', 'cmdb_ci_storage_port');
pr.query();
ids = [];
while (pr.next())
    ids.push('' + pr.child);

current.addQuery('sys_id', ids);
