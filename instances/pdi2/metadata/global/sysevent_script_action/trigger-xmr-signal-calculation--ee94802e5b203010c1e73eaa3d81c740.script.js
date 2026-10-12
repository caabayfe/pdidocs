var script="var input = "+event.parm1+";new SNC.XMRSignalCalculator(JSON.stringify(input)).runXMRSignalCalculator();";
var gr = new GlideRecord('sys_trigger');
gr.initialize();
gr.setValue("trigger_type", 0); //trigger_type 0 is for Run Once.
gr.setValue("script", script);
gr.setValue("job_id", "81c92ce9c0a8016400e5f0d2f784ea78"); //set job_id for RunScriptJob
gr.setValue("name", "CalculateXMRSignals");
var sysId = gr.insert();
gs.info("sys_trigger record CalculateXMRSignals inserted for signal calculation with sys_id:" + sysId);
