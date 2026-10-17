// variables available
// current: GlideRecord -  target incident
// definition: GlideRecord -  (this row)
if(pm.isActive('com.snc.best_practice.problem.madrid.state_model')){
	if(current.problem_state == ProblemState.STATES.RESOLVED && current.resolution_code == ProblemState.RESOLUTION_CODES.FIX_APPLIED)
		createMetric();
}
else{
	if(current.problem_state == 4)
		createMetric();
}

function createMetric() {
  var mi = new MetricInstance(definition, current);
  if (mi.metricExists()) 
    return; 

  var gr = mi.getNewRecord();
  gr.start = current.sys_created_on;
  gr.end = current.sys_updated_on;
  gr.duration = gs.dateDiff(gr.start, gr.end);
  gr.calculation_complete = true;
  gr.insert();
}
