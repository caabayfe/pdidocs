
    if (!pm.isZboot()){

        //Check if we have legacy event processors
		var legacyJobs = queryLegacyEventsProcessJobs();
		var legacyJobsCount = legacyJobs.getRowCount();

		if (legacyJobsCount > 0) {
			
		    // Make sure we now have the new event processors 
		    var newEventsProcessJobs = queryNewEventsProcessJobs();
		    var newEventsProcessJobsCount = newEventsProcessJobs.getRowCount();

		    if (newEventsProcessJobsCount > 0) {
		        gs.print("Deleting the legacy events process job now");
		        deleteLegacyEventsProcessJobs();
		    } else {
		        gs.print("Could not find new event processors!");
		    }

		    gs.print("Completed converting legacy event processors to new event processors");

		}else{
			gs.print("Could not find legacy event processors!");
		}
	}




		function queryLegacyEventsProcessJobs() {
		    var eventsJobs = new GlideRecord("sys_trigger");
		    eventsJobs.addQuery("job_context", "CONTAINS", "gs.eventsProcess()");
		    eventsJobs.orderBy("repeat");
		    eventsJobs.query();

		    gs.print("Found " + eventsJobs.getRowCount() + " job(s) matching query: [" + eventsJobs.getEncodedQuery() + "]");
		    return eventsJobs;
		}

		function queryNewEventsProcessJobs() {
		    var eventsJobs = new GlideRecord("sys_trigger");
		    eventsJobs.addEncodedQuery("job_contextLIKEgs.processDelegatedEvents^system_id=^ORsystem_id!=ACTIVE NODES");
		    eventsJobs.query();

		    return eventsJobs;
		}

		function deleteLegacyEventsProcessJobs() {
		    var eventsJobs = queryLegacyEventsProcessJobs();

		    while (eventsJobs.next()) {
		        gs.print("Delete existing legacy events processor - " + eventsJobs.getValue("sys_id"));
		        eventsJobs.deleteRecord();
		    }
		}
