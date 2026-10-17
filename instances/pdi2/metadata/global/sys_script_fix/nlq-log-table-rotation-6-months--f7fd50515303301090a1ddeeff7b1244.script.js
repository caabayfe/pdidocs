var duration_7days = gs.getDurationDate('7 0:0:0');
var duration_30days = gs.getDurationDate('30 0:0:0');

var gr = new GlideRecord("sys_table_rotation");
gr.addQuery('name=nlq_query_log^ORname=nlq_table_guesser_query_log');
gr.addQuery('duration',  duration_7days);
gr.setValue('duration', duration_30days);
gr.updateMultiple();
