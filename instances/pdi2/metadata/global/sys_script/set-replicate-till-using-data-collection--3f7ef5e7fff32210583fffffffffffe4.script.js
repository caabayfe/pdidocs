(function executeRule(current, previous /*null when async*/ ) {
	var replicateGr = new GlideRecord("pa_cdc_source_replicate_till");
	if (!replicateGr.get("analytics_source", current.getValue("id")))
		insertNewRecord(current.id);

	replicateGr.get("analytics_source", current.id);
    if (current.getValue("is_data_collection_enabled") == "1") {
        replicateGr.replicate_till = ""; //start/continue replication as data collection is enabled.
        replicateGr.update();
        return;
    }
    if (current.getValue("frequency") == "daily")
        setValueForNonIntraday(replicateGr);
    else
        setValueForIntraday(replicateGr);

})(current, previous);

//For intraday sources, continue replicating for 1 day.
function setValueForIntraday(replicateGr) {
    var gdt = new GlideDateTime();
    gdt.addDays(1);
    replicateGr.replicate_till = gdt;
	replicateGr.update();
}

//For non-intraday source, continue replicating to the next EOD in the source time zone
function setValueForNonIntraday(replicateGr) {
    var gdt = new GlideDateTime();
    var tzInString = current.getValue("run_as_tz");
    var tz = Packages.java.util.TimeZone.getTimeZone(tzInString);
    gdt.setTZ(tz); //setting the time zone to source TZ
    gdt.setDisplayValue(gdt.getDate() + " 23:59:59"); //setting the time to EOD in source TZ
    gdt.addDays(1); //moving the date to next day.
    replicateGr.replicate_till = gdt;
	replicateGr.update();
}

function insertNewRecord(sourceId) {
	var gr = new GlideRecord("pa_cdc_source_replicate_till");
	gr.initialize();
	gr.analytics_source = sourceId;
	gr.insert();
}
