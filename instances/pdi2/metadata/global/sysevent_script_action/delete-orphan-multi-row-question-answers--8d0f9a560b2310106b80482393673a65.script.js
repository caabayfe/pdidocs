var tableName = 'sc_cart_item';
var sysId = event.parm1 + '';
var mrvsRowGr = new GlideRecord('sc_multi_row_question_answer');
mrvsRowGr.addQuery('parent_table_name', tableName);
mrvsRowGr.addQuery('parent_id', sysId);
mrvsRowGr.query();
mrvsRowGr.deleteMultiple();
