// transform asynchronous import sets that are already loaded
// daily at midnight
transformAsyncIset();

function transformAsyncIset() {
var importSet = new GlideRecord("sys_import_set");
importSet.addQuery("mode", "asynchronous");
importSet.addQuery("state", "loaded");
importSet.query();
  while(importSet.next()) {
	var importSetRun = new GlideRecord('sys_import_set_run');
	importSetRun.addQuery('set', importSet.sys_id);
	importSetRun.addQuery('state', 'running');
	importSetRun.query();
	if (!importSetRun.next())
		sTransform(importSet);
  }
}

function sTransform(igr) {
    var mapsList = getMap(igr.table_name);

    var t = new GlideImportSetTransformerWorker(igr.sys_id, mapsList);
    t.setProgressName("Transforming: " + igr.number);
    t.setBackground(true);
    t.start();
}

function getMap(sTable) {
    var mapGR = new GlideRecord("sys_transform_map");
    mapGR.addQuery("source_table", sTable);
    mapGR.addActiveQuery();
    mapGR.query();

    var mapsList = [];
    while(mapGR.next())
        mapsList.push(mapGR.getUniqueValue());

    return mapsList.join();
}
