(function executeRule(current, previous /*null when async*/ ) {

    var curVal = current.value == "true" ? true : false;
    var gr = new GlideRecord("cds_client_schedule");
    if (gr.get("48c5005f93a542103c67134732891864")) {
        gr.active = curVal;
        gr.update();
    }

    var grJob = new GlideRecord("sysauto_script");
    if (grJob.get("1e318661a00ec210f877d142267461f4")) {
        grJob.active = curVal;
        grJob.update();
    }

})(current, previous);
