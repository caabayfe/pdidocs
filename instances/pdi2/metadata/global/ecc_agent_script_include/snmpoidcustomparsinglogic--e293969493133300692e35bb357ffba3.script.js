this.snmmpOID = SNMP_OID;
this.snmmpVar = SNMP_VARIABLE;
this.GregorianCalendar = Packages.java.util.GregorianCalendar;
this.SimpleDateFormat = Packages.java.text.SimpleDateFormat;
this.TimeZone = Packages.java.util.TimeZone;
this.Calendar = Packages.java.util.Calendar;

rtrn = this.parseCustomObject();

function parseCustomObject(){
	ms.log("parse custom object " + this.snmmpOID + " " + this.snmmpVar);
	
	if(this.snmmpOID.includes('cucsFaultCreationTime') ||
		this.snmmpOID.includes('cucsFaultLastModificationTime')){
		return this.parseDateAndTime(); 
	}
	
	return "undefined";
}

function parseDateAndTime(){
	ms.log('Transforming DateAndTime OID to GlideDateTime');
	var gCalendar = this.makeCalendar(this.snmmpVar);
    var glideDateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var glideTimeStr = glideDateTimeFormat.format(gCalendar.getTime());
	ms.log('GlideDateAndTime is: ' + glideTimeStr);
	return glideTimeStr;	
}

function makeCalendar(dateAndTimeValue){
	ms.log("makeCalendar " + dateAndTimeValue);
	var year = (dateAndTimeValue.get(0) & 0xFF ) * 256 + (dateAndTimeValue.get(1) & 0xFF );
	var month = (dateAndTimeValue.get(2) & 0xFF );
    var date = (dateAndTimeValue.get(3) & 0xFF );
    var hour = (dateAndTimeValue.get(4) & 0xFF );
    var minute = (dateAndTimeValue.get(5) & 0xFF );
    var second = (dateAndTimeValue.get(6) & 0xFF );
    var deci = (dateAndTimeValue.get(7) & 0xFF );
	var gc = new GregorianCalendar(year, month-1, date, hour, minute, second);
	gc.set(Calendar.MILLISECOND, deci*100);
	return gc;
}
