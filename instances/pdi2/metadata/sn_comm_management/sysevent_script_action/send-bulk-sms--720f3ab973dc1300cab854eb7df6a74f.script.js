/*
 event.parm1 == from and to phone numbers
 event.parm2 == message
*/
if(event.parm1 && event.parm2) {
	var notify = new sn_notify.NotifyScoped();
	var numbers = JSON.parse(event.parm1);
	notify.sendBulkSMS(numbers.notifyNumber, numbers.toNumbers, event.parm2, current);
}
