
gs.info("Setting system property glide.identification_engine.self_cleaning_mutex_enabled");
var script = "(function (){\n" +
		"	gs.setProperty('glide.identification_engine.self_cleaning_mutex_enabled', 'false');\n" +
		"	gs.info('Disabling self cleaning mutex. IRE will switch using to BatchSelfCleaning mutex');\n" +
		"})()";

var when = new GlideDateTime();
when.add(60 * 60 * 1000); //Adding an hour to be on safer side to make sure all the upgrade is done. 
GlideRunScriptJob.scheduleScript(script, 'Activate Batch Mutex', when);
