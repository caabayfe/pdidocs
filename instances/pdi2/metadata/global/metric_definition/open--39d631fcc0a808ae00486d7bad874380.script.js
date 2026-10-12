// script can set answer to false to terminate processing of the metric
// mi - MonitorInstance
// answer
if (!current.active) {
  answer = false;
  mi.endDuration();
  closeDurations(mi.current);
}

function closeDurations(current) {
    var gr = new GlideRecord('metric_instance');
    gr.addQuery('id', current.sys_id);
    gr.addQuery('calculation_complete', false);
    gr.addQuery('definition.type', 'field_value_duration');
    gr.query();
    while (gr.next()) {
       var definition = new GlideRecord('metric_definition');
       definition.get(gr.definition);
       var mi = new MetricInstance(definition, current);
       mi.endDuration();
    }
}
  
