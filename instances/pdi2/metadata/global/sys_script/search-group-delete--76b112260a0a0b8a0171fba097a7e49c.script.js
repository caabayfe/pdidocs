var grouppref = new GlideRecord('sys_user_preference');
grouppref.addQuery('name','CONTAINS',current.sys_id);
grouppref.deleteMultiple();

var table = new GlideRecord('ts_table');
table.query('group',current.sys_id);
while (table.next()) {
  table.deleteRecord();
}
