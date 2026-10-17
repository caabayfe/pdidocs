gs.info("Running fix script: EM - Remove unknown nodes (domain)");
var startTime = new GlideDateTime().getNumericValue();
var md = new GlideMultipleDelete('em_unique_nodes');
md.addQuery('type', 'unknown');
md.execute();
var endTime = new GlideDateTime().getNumericValue();
var diff = endTime - startTime;
gs.info("Unknown nodes removal took {0} milliseconds to run.", diff);
