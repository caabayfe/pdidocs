(function executeRule(current, previous /*null when async*/) {

	add_entry("series-requested", "false");
	
	var start = new GlideDateTime();
	var end = new GlideDateTime();
	
	start.addSeconds(-600);

	var gr = new GlideRecord('v_clotho_series');
	gr.addQuery('name', "Index#series");
	gr.query();

	var transform = new sn_clotho.Transformer(gr);
	transform.metric('count');

	var result = transform.execute(start, end);
	result = result.getData().getValues();
	if (result.length > 0) {
		result = Math.round(result[result.length - 1]).toString();
	} else {
		result = 0;
	}

	add_entry("total-series", result);
	
	var dayRecord = new GlideRecord('mb_dashboard_stats');
	dayRecord.addQuery('entry', "days");
	dayRecord.query();
	dayRecord.next();
	var days = -1 * parseInt(dayRecord.value);
	
	var mb = new GlideRecord('v_clotho_series');
	mb.addQuery('name', "Index#series");
	mb.query();
	
	var gdt = new GlideDateTime();
	gdt.addDaysLocalTime(days);
	var metric = "count";

	var client = new sn_clotho.Client();

	var res = client.getSeries(mb, metric, gdt);
	add_entry("count", res.length.toString());

})(current, previous);

/*
this is a wrapper function to simplify ALL gliderecord entries. 

 the table mb_dashboard_stats has two columns
- entry: the label for an entry (used to signify what's being stored)
- value: the actual value being stored
*/
function add_entry(entry, value) {
	var gr = new GlideRecord('mb_dashboard_stats');
	var now = gs.now();
	
	gr.addQuery("entry", entry);
	gr.query();
	var exists = gr.hasNext();
	
	if (exists) {
		gr.next();
	} else {
		gr.initialize();
		gr.entry = entry;
	}
	gr.value = value;
	gr.sys_updated_on = now;
	gr.update();
}
