var noThreatGR = new GlideRecord('attachment_scan_history');
noThreatGR.addQuery('status', 'no_threat_detected');
noThreatGR.addQuery('sys_created_on', '<', gs.daysAgo(30));
noThreatGR.query();
noThreatGR.deleteMultiple();

// Clear Scan History records where scan fails. Do not remove infected entries
var gr = new GlideRecord('attachment_scan_history');
gr.addQuery('status', '!=', 'infected');
gr.addQuery('sys_created_on', '<', gs.daysAgo(90));
gr.query();
gr.deleteMultiple();
