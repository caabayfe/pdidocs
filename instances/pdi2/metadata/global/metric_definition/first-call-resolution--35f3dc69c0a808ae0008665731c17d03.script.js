// variables available
// current: GlideRecord -  target incident
// definition: GlideRecord -  (this row)
if (current.sys_mod_count == 0) {
  var value = false;
  if (!current.active)
      value = true;
     
  createMetric(value);
}

function createMetric(value) {
  var mi = new MetricInstance(definition, current);
  if (mi.metricExists()) 
    return;

  var gr = mi.getNewRecord();
  gr.field_value = value;
  gr.field = null;
  gr.calculation_complete = true;
  gr.insert();
}
