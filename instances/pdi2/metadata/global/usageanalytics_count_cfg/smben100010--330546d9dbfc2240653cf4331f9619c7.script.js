var totalTTRSecs = 0;
var totalTTRMins = 0;

function getTTRForP0INTs() {

	var incidentTbl = "incident";

	if(!GlideTableDescriptor.isValid(incidentTbl)) 
		return 0;
		
	var grClosed = new GlideRecord(incidentTbl);
	//All INTs closed Yesterday
	grClosed.addEncodedQuery("priority=0^closed_atONYesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)^closed_atISNOTEMPTY");
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

answer = '{"count": "' + getTTRForP0INTs() + '","TotalTTR(Seconds)":"' + totalTTRSecs + '"}';
