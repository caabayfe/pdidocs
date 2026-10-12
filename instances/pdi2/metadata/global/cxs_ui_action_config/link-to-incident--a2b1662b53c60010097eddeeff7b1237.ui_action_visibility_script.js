/**
 * current (GlideRecord): GlideRecord object of form record.
 * resource (GlideRecord): GlideRecord object of search result record.
 * visible (boolean): Script writer needs to set this variable to true/false to determine whether to show/hide this UI action.
 */
var gr = new GlideRecord("task_outage");
gr.addQuery("task", current.getUniqueValue());
gr.addQuery("outage", resource.getUniqueValue());
gr.setLimit(1);
gr.query();
visible = !gr.hasNext();
