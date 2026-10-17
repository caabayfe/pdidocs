// server -> pools
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('child', parent.sys_id);
cr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_pool');
cr.query();
var ids = [];
while (cr.next())
    ids.push(''+cr.parent);

// pools -> volumes
var sp = new GlideRecord('cmdb_rel_ci');
sp.addQuery('child', ids);
cr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_volume');
sp.query();

ids = [];
while (sp.next())
    ids.push(''+sp.parent);

current.addQuery('sys_id', ids);
