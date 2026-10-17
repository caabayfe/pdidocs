// current: GlideRecord - event scheduled on behalf of (incident for example) 

createCommitmentHistory();

function createCommitmentHistory() {
	var ac = null;
	var infoMsg = '';
	var avUtils = new global.AvailabilityUtils();
	var avConstants = new global.AvailabilityConstants();
	var ciClass = avUtils.getCiClassFromCommitment(current);
	if (current.service_commitment.type == 'availability') {
		if (checkAvailability(ciClass))
			return;		
		infoMsg = gs.getMessage("Historical availability calculated for Service Offering: {0} for Commitment: {1}", [current.service_offering.getDisplayValue(), current.service_commitment.getDisplayValue()]);
		if (gs.getProperty(avConstants.PROP_AVAILABILITY_V2) === 'true') {
			var begin = new GlideDateTime();
			begin.addDays(-365);
			var end = new GlideDateTime();
			ac = new global.AvailabilitySummarizerV2();
			ac.setCommitments([current.service_commitment.sys_id]);
			ac.setCi(ciClass === 'service_offering' ? current.service_offering : current.cmdb_ci);
			ac.summarize(begin, end);
			return;
		}
		else
			ac = new global.AvailabilitySummarizer();

	} else if (current.service_commitment.type == 'SLA') {
		if (checkSLAResult())
			return;
		
		ac = new global.SLAResultSummarizer();
		infoMsg = gs.getMessage("Historical SLA Results calculated for Service Offering: {0} for new Commitment: {1}", [current.service_offering.getDisplayValue(), current.service_commitment.getDisplayValue()]);
	} else {
		return;
	}
	ac.setCommitment(current.service_commitment);
	if (ciClass === 'service_offering')
		ac.setCI(current.service_offering);
	else if (ciClass != null)
		ac.setCI(current.cmdb_ci);
	else
		return;

	//Setting timezone to system timezone for calculations
	var oldTZ = gs.getSession().getTimeZoneName();
	var defaultTZ = GlideUser.getSysTimeZone();
	gs.debug('setting timezone to ' + defaultTZ + ' for SPM commitment history calculations');
	gs.getSession().setTimeZoneName(defaultTZ);
	
	// need to calculate daily results from beginning of month 12 months ago
	// to end of this month		
	for (var i = 397; true; i--) {
		var dayZero = gs.daysAgoStart(i);
		var start = new GlideDateTime(dayZero);
		if (start < gs.monthsAgoStart(12))
			continue;

		if (start > gs.endOfThisMonth())
			break;

		ac.summarize(start.getValue());
	}	
	ac.summarize(); // recalc today since data is now there for this month's monthly
		
	gs.info(infoMsg);
	gs.debug('restoring session timezone to ' + oldTZ + ' after SPM commitment history calculations');
	gs.getSession().setTimeZoneName(oldTZ);
}

//check to see if sla results already exist for offering and commitment
function checkAvailability(ciClass) {
	var availabilityGr = new GlideRecord('service_availability');
	if (ciClass === 'service_offering')
		availabilityGr.addQuery('service_offering', current.service_offering);
	else if (ciClass != null)
		availabilityGr.addQuery('cmdb_ci', current.cmdb_ci);
	else
		return true;
	availabilityGr.addQuery('service_commitment', current.service_commitment);
	availabilityGr.query();
	
	return availabilityGr.hasNext();
}

//check to see if sla results already exist for offering and commitment
function checkSLAResult() {
	//Check that there is no existing sla results for the service offering and commitment
	var resultGr = new GlideRecord('service_sla_result');
	resultGr.addQuery('service_offering', current.service_offering);
	resultGr.addQuery('service_commitment', current.service_commitment);
	resultGr.query();
	
	return resultGr.hasNext();
}
