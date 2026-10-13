var notifyNumber = new GlideRecord('notify_number');

notifyNumber.addNullQuery('number').addOrCondition('number',' '); /* Check for short_code null or blank*/
notifyNumber.addNotNullQuery('phone_number'); /* Check only for records that have a phone number */
notifyNumber.addActiveQuery(); /* Check only for active records */
notifyNumber.query();

var num = 0;
while(notifyNumber.next()) {
	gs.log("Before update of number field : "+notifyNumber.number);
	var number = notifyNumber.getValue("phone_number");
	gs.log("updating number to :"+number);
	notifyNumber.setValue("number",  number);
	notifyNumber.update();
	gs.log("After update of number field : "+notifyNumber.number);
    num++;
}
gs.log("Populated " + num + " empty notify_number.number fields");
