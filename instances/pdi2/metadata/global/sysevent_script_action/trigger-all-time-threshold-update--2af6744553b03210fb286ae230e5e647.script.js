var script="var input1 = "+event.parm1+";var input2 = "+event.parm2+";new SNC.AllTimeThresholdCollector().evaluateAllTimeThresholds(JSON.stringify(input1), JSON.stringify(input2));";
var gr = new GlideRecord('sys_trigger');
gr.initialize();
gr.setValue("trigger_type", 0); //trigger_type 0 is for Run Once.
gr.setValue("script", script);
gr.setValue("job_id", "81c92ce9c0a8016400e5f0d2f784ea78"); //set job_id for RunScriptJob
gr.setValue("name", "AllTimeThresholdCollector");
var sysId = gr.insert();
gs.info("sys_trigger record AllTimeThresholdCollector inserted for All-Time Threshold update with sys_id:" + sysId);
