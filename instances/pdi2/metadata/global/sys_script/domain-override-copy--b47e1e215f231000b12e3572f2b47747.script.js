copyGaugeCounts();

function copyGaugeCounts() {
   var gr = new GlideRecord("sys_gauge_counts");
   if (!gr.isValid())
      return;

   gr.addQuery("gauge_id", current.sys_overrides);
   gr.query();
   while (gr.next()) {
      gr.gauge_id = current.getUniqueValue();
      gr.insert();
   }
}
