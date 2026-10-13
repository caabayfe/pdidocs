var gr = new GlideRecord('sys_trigger');
gr.addQuery('name', 'STARTSWITH', 'Event Management - process events');
gr.query();
var rows = gr.getRowCount();
if (rows > 1 && gr.get('8bba2864eb03110045e1a5115206feab')) {
	gr.deleteRecord();
}
