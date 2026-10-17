var oldLimit = event.parm1;
var newLimit = event.parm2;

deleteOlderPwdHistoryEntries(oldLimit, newLimit);

function deleteOlderPwdHistoryEntries(oldLimit, newLimit) {
	var gr = new GlideRecord('pwd_history');
	gr.addQuery('order', '>', newLimit);
	gr.query();
	gr.deleteMultiple();
}
