// port -> controllers
var cr = new GlideRecord('cmdb_rel_ci');
cr.addQuery('parent.sys_class_name', 'cmdb_ci_storage_controller');
cr.addQuery('child', parent.sys_id);
cr.query();
var ids = [];
while (cr.next())
    ids.push('' + cr.parent);

current.addQuery('sys_id', ids);
