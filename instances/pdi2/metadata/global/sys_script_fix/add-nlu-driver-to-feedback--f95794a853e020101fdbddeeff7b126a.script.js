var gr = new GlideRecord('open_nlu_predict_feedback');
gr.query();
while (gr.next()) {
  // fetch audit log value
  var audit_log = gr.audit_log;
  if (!audit_log) {
    continue;
  }

  // fetch audit log reference
  var audit_log_ref = audit_log.getRefRecord();
  if (!audit_log_ref) {
    continue;
  }

  // determine nlu_driver id
  var nlu_driver = audit_log_ref.getValue('nlu_driver');
  if (!nlu_driver) {
    continue;
  }
    
  gr.setValue('nlu_provider', nlu_driver);
  gr.update();
}
