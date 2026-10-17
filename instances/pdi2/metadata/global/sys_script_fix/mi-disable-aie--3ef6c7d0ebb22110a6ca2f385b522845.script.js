// Disable the metric type to ci sync job

gs.info("**Updating disabling the Update Metric CI Type Map job");

var job = new GlideRecord("sysauto_script");
var found = job.get("0e954bc5d7951300918d6dbd6e6103c1");

if (found){
	job.setValue("active", false);
	job.update();
}

// Empty the metric ci type map table

gs.info("**Emptying the sa_metric_ci_type_map table");

var map = new GlideRecord("sa_metric_ci_type_map");
map.query();

map.deleteMultiple();

gs.info("**Done removing AIE leftovers");
