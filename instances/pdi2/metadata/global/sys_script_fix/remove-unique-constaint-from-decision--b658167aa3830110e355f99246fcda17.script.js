var tableName = 'sys_decision';
var columnName = 'name';

// set unique false
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("element", columnName);
gr.addQuery("name", tableName);
gr.query();
gr.next();
gr.setValue("unique", false);
gr.setWorkflow(false);
gr.update();

// Remove index created on Name field in DB
var isUniqueIndex = true;
var columnsInIndex = [columnName];
var util = new GlideIndexUtils();
util.dropByExactElementSequence(tableName, isUniqueIndex, columnsInIndex);
