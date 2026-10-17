var SCHEDULED_AUDITOR_SCAN = "789a691d51031110fa9bb36230460140";
var gr = new GlideRecord("sysauto_scan");
if (gr.get(SCHEDULED_AUDITOR_SCAN))
    gs.executeNow(gr);
