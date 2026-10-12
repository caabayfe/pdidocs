var discovery_sources_str = GlideProperties.get('sm.dedup_tracker.discovery_sources');
var numRows = 0;

if (!!discovery_sources_str) {
	gs.log("quering for dedup tracked discovery sources");
	var gr = new GlideRecord("cmdb_ci_appl");
	gr.addQuery("discovery_sources",discovery_sources_str);
	gr.query();
	numRows = gr.getRowCount();
	gs.log("found " + numRows + " rows");
}

!!discovery_sources_str && numRows > 0;
