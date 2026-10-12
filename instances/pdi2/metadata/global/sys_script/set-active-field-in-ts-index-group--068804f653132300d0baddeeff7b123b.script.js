var grGroups = new GlideRecord('ts_index_group');
grGroups.addEncodedQuery('tablesLIKE' + current.table);
grGroups.query();
var tsUtil = new GlideTSUtil();
while (grGroups.next() ) {
	var groupGR = getIndexGroupRecord(grGroups.name);
	if (groupGR && groupGR.tables) {
		var active = tsUtil.isIndexGroupActive(grGroups.tables);
		if (active != groupGR.getBooleanAttribute('active')) {
			tsUtil.flushIndexGroupCache();
			break;
		}
	}
}

function getIndexGroupRecord(name) {
	var gr = new GlideRecord('ts_index_group');
	gr.addQuery('name', name);
	gr.query();
	if (gr.next())
	    return gr;
	
	return null;
}
