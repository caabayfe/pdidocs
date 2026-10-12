updateWidgetCount(current.value);

function updateWidgetCount(widget) {
   var rec = new GlideRecord('pa_widgets');
   if (!rec.get(widget))
      return;

   var gr = new GlideAggregate('sys_portal_preferences');
   gr.addQuery('name', 'sys_id');
   gr.addQuery('value', widget);
   gr.addAggregate('COUNT');
   gr.query();
   var count = gr.next() ? gr.getAggregate('COUNT') : 0;

   rec.related_dashboards = count;
   rec.updateNoDomain();
}
