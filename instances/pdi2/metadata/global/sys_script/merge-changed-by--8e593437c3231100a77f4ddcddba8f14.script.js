// Query for any changes to the same version record in the new state from the same parent instance
var gr = new GlideRecord('sys_sync_change');
gr.addQuery('version.name', current.version.name);
gr.addQuery('state', 'new');
gr.addQuery('instance', current.instance);
gr.addQuery('sys_id', '!=', current.sys_id);
gr.query();

var arr = [];
while (gr.next()) {
	arr = arr.concat(gr.changed_by.toString().split(','));
}

var changedBy = '';
arr = arr.concat(current.changed_by.toString().split(','));
for (var i = 0; i < arr.length; i++) {
	var id = arr[i];
	if (changedBy.indexOf(id) == -1) {
		if (changedBy != '') {
			changedBy += ',';
		}
		changedBy += id;
	}
}

current.changed_by = changedBy;
