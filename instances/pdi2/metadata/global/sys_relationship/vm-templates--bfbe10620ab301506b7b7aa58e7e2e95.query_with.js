var gr = new GlideRecord('cmdb_rel_ci');
gr.addQuery('child', parent.sys_id);
gr.addQuery('type.name', 'Registered on::Has registered');
gr.query();
var vm_ids = [];
while (gr.next())
    vm_ids.push('' + gr.parent);
current.addQuery('sys_id', vm_ids);
