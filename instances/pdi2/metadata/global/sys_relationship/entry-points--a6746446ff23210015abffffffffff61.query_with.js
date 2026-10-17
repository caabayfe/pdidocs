var gr = new GlideRecord('cmdb_rel_ci');
gr.addQuery('parent', parent.sys_id);
gr.addQuery('type.name', 'Starts with::Starts');
gr.query();
var ep_ids = [];
while (gr.next())
    ep_ids.push(gr.child + '');

current.addQuery('sys_id', ep_ids);
