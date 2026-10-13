gs.info("**FIX SCRIPT : Updating sys_metric OI Retention Policies");

var metrics = new GlideRecord("sys_metric");
metrics.addQuery('retention_policy','fcca72a3c3003200e9e31f3292d3ae17');
metrics.query();

if (metrics.getRowCount() > 0){
  var rp = new GlideRecord("sys_metric_retention_policy");
  rp.get('5fc0dd325320111089b7ddeeff7b1292');

  if (rp.isValidRecord()){
    metrics.setValue('retention_policy', '5fc0dd325320111089b7ddeeff7b1292');
    metrics.updateMultiple();
    gs.info("**FIX SCRIPT : Attempting to update " + metrics.getRowCount() + " sys_metric records");
  }
  else {
    gs.error("**FIX SCRIPT : Could not find MI retention policy");
  }
}
else {
  gs.info("**FIX SCRIPT : no MI sys_metrics record found");
}

gs.info("**FIX SCRIPT : Done Updating sys_metric OI Retention Policies");
