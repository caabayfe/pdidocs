var serverId = parent.sys_id;
var relType = 'Used by';
var relCI = new GlideRecord('cmdb_rel_ci');
relCI.addQuery('child', serverId);
relCI.addQuery('type.child_descriptor', relType);
relCI.query();
var ids = [];
while (relCI.next())
	ids.push(relCI.parent+'');

current.addQuery('sys_id', 'IN', ids.join(','));
