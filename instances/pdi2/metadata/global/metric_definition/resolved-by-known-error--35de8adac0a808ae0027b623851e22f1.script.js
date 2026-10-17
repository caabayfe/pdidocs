// variables available
// current: GlideRecord -  target incident
// definition: GlideRecord -  (this row)
if (!current.active) {
    if (current.problem_id.problem_state == '2')
        createMetric();
}

function createMetric() {
  var mi = new MetricInstance(definition, current);
  if (mi.metricExists()) 
    return;

  var gr = mi.getNewRecord();
  gr.field_value = true;
  gr.calculation_complete = true;
  gr.insert();
}
