var tableToReferenceColumn = {
      "sys_flow_execution_history": "context",
      "sys_flow_report_doc": "context",
  };
  for (var table in tableToReferenceColumn) {
      var referenceColumn = tableToReferenceColumn[table];
      var dic = new GlideRecord("sys_dictionary");
      dic.addQuery("name", table);
      dic.addQuery("element", referenceColumn);
      dic.query();
      if (dic.next()) {
          gs.info("reference_cascade_rule before change is " + dic.getValue("reference_cascade_rule"));
          dic.setValue("reference_cascade_rule", "none");
          dic.setWorkflow(false);
          dic.update();
          gs.info("reference_cascade_rule after change is " + dic.getValue("reference_cascade_rule"));
      }
}
