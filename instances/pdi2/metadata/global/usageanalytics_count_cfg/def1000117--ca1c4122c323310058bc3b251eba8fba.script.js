// get the accrualPeriod of last month in internal dateformat
var accrualPeriod =  gs.beginningOfLastMonth().substring(0,7);
answer = -1;
var tableName = 'ua_app_usage';
if (GlideTableDescriptor.isValid(tableName)) {
	var gr = new GlideRecord(tableName);
	gr.addQuery('time_stamp', accrualPeriod);
	gr.query();
	answer = gr.getRowCount();
}
