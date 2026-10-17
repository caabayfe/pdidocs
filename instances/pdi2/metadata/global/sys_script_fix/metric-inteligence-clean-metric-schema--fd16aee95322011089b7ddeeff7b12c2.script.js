gs.info("Starting 'Metric Inteligence - Clean Metric Schema' fix script");

var schJob = new GlideRecord("sysauto_script");
schJob.get("dd290da7b7331010bded8b96ce11a939");
if (schJob.isValidRecord()){
	schJob.deleteRecord();
}

var sysScript = new GlideRecord("sys_script_include");
sysScript.get("aa1758e2b7031010bded8b96ce11a90b");
if(sysScript.isValidRecord()){
	sysScript.deleteRecord();
}

var schema = new GlideRecord("sa_metric_schema_definition");
schema.query();
if(schema.isValid()){
	schema.deleteMultiple();
}
gs.info("Finished 'Metric Inteligence - Clean Metric Schema' fix script");
