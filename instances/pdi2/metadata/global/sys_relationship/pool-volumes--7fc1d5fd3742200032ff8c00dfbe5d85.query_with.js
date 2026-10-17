// pool -> volumes
var vr = new GlideRecord('cmdb_rel_ci');
vr.addQuery('child', parent.sys_id);
vr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_volume');
vr.query();

var ids = [];
while (vr.next())
    ids.push(''+vr.parent);

current.addQuery('sys_id', ids);
