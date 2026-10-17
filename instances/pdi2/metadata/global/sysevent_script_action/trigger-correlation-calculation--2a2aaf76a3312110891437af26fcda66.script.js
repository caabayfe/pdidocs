var script="var input = "+event.parm1+";new SNC.PACorrelationCalculator(JSON.stringify(input)).runCorrelationCalculator();";
var gr = new GlideRecord('sys_trigger');
gr.initialize();
gr.setValue("trigger_type", 0); //trigger_type 0 is for Run Once.
gr.setValue("script", script);
gr.setValue("job_id", "81c92ce9c0a8016400e5f0d2f784ea78"); //set job_id for RunScriptJob
gr.setValue("name", "CalculateCorrelation");
var sysId = gr.insert();
gs.info("sys_trigger record CalculateCorrelation inserted for correlation calculation with sys_id:" + sysId);
