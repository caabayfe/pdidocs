// set unique false
var gr = new GlideRecord("sys_dictionary");
gr.addQuery("element", "tour_id");
gr.addQuery("name", "sys_embedded_tour_guide");
gr.query();
gr.next();
gr.setValue("unique", false);
gr.setWorkflow(false);
gr.update();

// remove from DB 
var tableName = 'sys_embedded_tour_guide';
var isUniqueIndex = true;
var columnsInIndex = ['tour_id'];
var util = new GlideIndexUtils();
util.dropByExactElementSequence(tableName, isUniqueIndex, columnsInIndex);
