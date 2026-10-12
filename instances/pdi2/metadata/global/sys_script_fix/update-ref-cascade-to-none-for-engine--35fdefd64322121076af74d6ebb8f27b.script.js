var tableToReferenceColumn = {
      "sys_flow_action_data": "context",
      "sys_flow_context_chunk": "document_id",
      "sys_flow_context_chunk_archive": "document_id",
      "sys_flow_listener": "sys_flow_context",
      "sys_flow_runtime_state_chunk": "document_id",
      "sys_flow_runtime_value": "context",
      "sys_flow_stats": "context",
      "sys_flow_val_listener": "context",
      "sys_flow_value": "context"
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
