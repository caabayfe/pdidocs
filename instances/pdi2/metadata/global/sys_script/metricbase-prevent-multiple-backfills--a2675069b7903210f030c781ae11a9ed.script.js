(function executeRule(current /*, previous */) {
  var t = current.getValue("type");
  if (t + "" !== "backfill") {
    return;
  }

  var gr = new GlideRecord("mb_ingest_job");
  gr.addQuery("type", "backfill");
  if (!current.isNewRecord()) {
    gr.addQuery("sys_id", "!=", current.getUniqueValue());
  }
  gr.setLimit(1);
  gr.query();
  if (gr.next()) {
    gs.addErrorMessage("Only one backfill job is allowed.");
    current.setAbortAction(true);
  }
})(current, previous);
