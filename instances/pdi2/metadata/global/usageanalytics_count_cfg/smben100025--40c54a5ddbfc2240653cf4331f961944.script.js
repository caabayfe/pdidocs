/*SUM(Time Closed-Time created for all INTs closed that day) where reassignment_count=0, closed yesterday*/

var totalTTRSecs = 0;
var totalTTRMins = 0;

function getTTRINTsFirstResolution() {

	var incidentTbl = "incident";

	if(!GlideTableDescriptor.isValid(incidentTbl)) 
		return 0;
		
	var grClosed = new GlideRecord(incidentTbl);
	//All INTs closed yesterday
	grClosed.addEncodedQuery("closed_atONYesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)^reassignment_count=0^closed_atISNOTEMPTY");
	
	grClosed.query();

	while (grClosed.next()) {
		
		var opened = grClosed.getValue("opened_at");
        var closed = grClosed.getValue("closed_at");
        var ttr = gs.dateDiff(opened, closed, true);
		
		totalTTRSecs += parseInt(ttr);	
		totalTTRMins += parseInt(ttr)/60;
	}
	
	return Math.round(totalTTRMins);
}

answer = '{"count": "' + getTTRINTsFirstResolution() + '","TotalTTR(Seconds)":"' + totalTTRSecs + '"}';
