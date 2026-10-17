// Set dialog_acts_supported to FALSE for ALL open_nlu_driver_language records
var gr = new GlideRecord("open_nlu_driver_language");
gr.initialize();
gr.setValue("dialog_acts_supported", false);
gr.setWorkflow(false);
gr.updateMultiple();

// Set dialog_acts_supported to TRUE for the "Service Now NLU record for English" record
gr = new GlideRecord("open_nlu_driver_language");
gr.initialize();
gr.get("297e8c635b2200101f254d3ba881c707");
gr.setValue("dialog_acts_supported", true);
gr.setWorkflow(false);
gr.update();
