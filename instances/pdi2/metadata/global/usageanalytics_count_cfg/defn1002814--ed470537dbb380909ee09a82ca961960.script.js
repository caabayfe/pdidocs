var ga = new GlideAggregate("svc_ci_assoc");
if(ga.isValid()) {
  ga.addJoinQuery("cmdb_ci_server","ci_id","sys_id");
  ga.groupBy("ci_id");
  ga.query();
  var mappedServersCnt = ga.getRowCount();
  answer = mappedServersCnt;
}
else {
  answer = 0;
}
