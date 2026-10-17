// pool -> disks
var vr = new GlideRecord('cmdb_rel_ci');
vr.addQuery('parent', parent.sys_id);
vr.addQuery('child.sys_class_name', 'cmdb_ci_storage_disk');
vr.query();

var ids = [];
while (vr.next())
    ids.push(''+vr.child);

current.addQuery('sys_id', ids);
