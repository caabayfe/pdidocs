// controller -> volumes
var vr = new GlideRecord('cmdb_rel_ci');
vr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_volume');
vr.addQuery('child', parent.sys_id);
vr.query();
var ids = [];
while (vr.next())
    ids.push('' + vr.parent);

current.addQuery('sys_id', ids);
