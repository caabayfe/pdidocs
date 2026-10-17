// variables available
// current: GlideRecord -  target incident
// definition: GlideRecord -  (this row)
var s = current.incident_state;
if (s >= 6)
  createMetric();

function createMetric() {
  var mi = new MetricInstance(definition, current);
  if (mi.metricExists()) 
    return; 

  var gr = mi.getNewRecord();
  gr.start = current.sys_created_on;
  gr.end = current.sys_updated_on;
  gr.duration = gs.dateDiff(gr.start.getDisplayValue(), gr.end.getDisplayValue());
  gr.calculation_complete = true;
  gr.insert();
}
