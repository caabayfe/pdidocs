var gr = new GlideRecord("sys_scope");
gr.query();
var total = gr.getRowCount();
gr.addQuery("js_level", "es_latest");
gr.query();
var es_latest = gr.getRowCount();
gr = new GlideRecord("sys_scope");
gr.addQuery("js_level", "helsinki_es5");
gr.query();
var es5 = gr.getRowCount();
gr = new GlideRecord("sys_scope");
gr.addQuery("js_level", "traditional");
gr.query();
var compatibility = gr.getRowCount();
gr = new GlideRecord("sys_scope");
gr.addQuery("js_level", "");
gr.query();
var unknown = gr.getRowCount();
gs.info("JS Level counts for scoped apps: es_latest=" + es_latest + ", es5=" + es5 + ", compatibility=" + compatibility + ", unknown=" + unknown + ", total=" + total);

var gcfMap = new GCFSampleMap();
gcfMap.put('unknown_apps', unknown.toString());
gcfMap.put('compatibility_apps', compatibility.toString());
gcfMap.put('es5_apps', es5.toString());
gcfMap.put('es_latest_apps', es_latest.toString());
gcfMap.put('total_apps', total.toString());

GCFCollector.recordUsageEvent('system_events', 'system_event_listener', 'system_upgraded', gcfMap);
