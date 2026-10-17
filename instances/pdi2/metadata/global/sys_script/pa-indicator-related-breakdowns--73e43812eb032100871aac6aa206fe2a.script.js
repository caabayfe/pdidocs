updateIndicatorCount(current.indicator);

function updateIndicatorCount(indicator) {
   var rec = new GlideRecord('pa_indicators');
   if (!rec.get(indicator))
      return;

   var gr = new GlideAggregate('pa_indicator_breakdowns');
   gr.addQuery("indicator", indicator);
   gr.addAggregate('COUNT');
   gr.queryNoDomain();
   var count = gr.next() ? gr.getAggregate('COUNT') : 0;
   
   rec.related_breakdowns = count;
   rec.updateNoDomain();
}
