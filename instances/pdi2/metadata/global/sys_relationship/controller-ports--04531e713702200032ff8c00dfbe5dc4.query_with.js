// controller -> ports
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('child', parent.sys_id);
cr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_port');
cr.query();

var ids = [];
while (cr.next())
    ids.push(''+cr.parent);

current.addQuery('sys_id', ids);
