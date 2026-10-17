var CAST_COUNT = 'cast_count';
var POLL = 'poll';
var pollId = current.getValue(POLL);
var gr = new GlideRecord('live_poll');
gr.get(pollId);
var count = parseInt(gr.getValue(CAST_COUNT));
gr.cast_count = count+1;
gr.update();

gr = new GlideRecord('live_poll_option');
var optionId = current.getValue('option');
gr.addQuery('sys_id', optionId);
gr.query();
while(gr.next()) {
	if(optionId == gr.getUniqueValue()) {
		count = parseInt(gr.getValue(CAST_COUNT));
		gr.cast_count = count+1;
		gr.update();
		break;
	}
}

var msgGR = new GlideRecord('live_message');
msgGR.addQuery(POLL, pollId);
msgGR.query();
if(msgGR.next()) {
	msgGR.last_activity = new GlideDateTime();
	msgGR.update();
}
