// runs every night at 2:00 AM (server time)
CONSTANTS = new AvailabilityConstants();
var start = new GlideDateTime();

if (gs.getProperty(CONSTANTS.PROP_AVAILABILITY_V2) === 'true') {
	// new Availability calculation
	// calculates today's availability
	var as = new AvailabilitySummarizerV2();
	var end = new GlideDateTime();
	start.setValue(gs.beginningOfToday());
	as.summarize(start, end);
}
else {
	// legacy Availability calculation
	// calculates the previous day's availability
	var ac = new AvailabilitySummarizer();
	start.setValue(gs.beginningOfYesterday());
	ac.summarize(start);
}
