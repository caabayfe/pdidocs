var id = '';
var targetLine = '';
if (parent.getTableName() == 'sys_history_set') {
   id = parent.sys_id + '';
   targetLine = parent.line_table + '';
   target = parent.table;
   targetID = parent.id;
} else if (!parent.isNewRecord()) {
	var ghs = new GlideHistorySet(parent);
	var gr = ghs.getSummaryRecord();
	if (gr !== null) {
		id = gr.sys_id + '';
		targetLine = gr.line_table + '';
		target = gr.table;
		targetID = gr.id;
	}
}

if (id != '') {
   current.addQuery('set', id);
   fieldAccessList(target, targetID);
   current.targetExtension(targetLine);
} else {
   current.addQuery('set', '1234');
}


function fieldAccessList(table, id) {
   var access = new Array();
   var denied = new Array();
   var target = new GlideRecord(table);
   target.get(id);
   var list = target.getElements();
   for (var i = 0; i < list.size(); i++) {
      var ge = list.get(i);
      var field = ge.getName();
      if (!field || field == '')
         continue;

      if (ge.canRead())
         access.push(field);
      else
         denied.push(field);
   }

   if (denied.length < access.length) {
       if (denied.length)
          current.addQuery('field', 'NOT IN', denied);
   } else {
       current.addQuery('field', access);
   }
}
