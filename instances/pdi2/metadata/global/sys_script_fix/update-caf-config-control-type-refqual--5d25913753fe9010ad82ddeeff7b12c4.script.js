updateControlTypeRefQualForCustomAdapterConfig();

function updateControlTypeRefQualForCustomAdapterConfig() {
  var gr = new GlideRecord("sys_dictionary");
  gr.addQuery("name", "sys_cs_custom_adapter_config");
  gr.addQuery("element", "control_type");
  gr.query();
  if (gr.next()) {
    gr.setValue(
      "reference_qual",
      "nameSTARTSWITHDefault^EQ"
    );
    gr.update();
  }
}
