var totalTTRSecs = 0;
var totalTTRMins = 0;

function getTTRForP2INTs() {

	var incidentTbl = "incident";

	if(!GlideTableDescriptor.isValid(incidentTbl)) 
		return 0;
		
	var grClosed = new GlideRecord(incidentTbl);
	//All INTs closed yesterday
	grClosed.addEncodedQuery("priority=2^closed_atONYesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)^closed_atISNOTEMPTY");
	
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

answer = '{"count": "' + getTTRForP2INTs() + '","TotalTTR(Seconds)":"' + totalTTRSecs + '"}';
