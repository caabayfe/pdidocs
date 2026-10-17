function script({ api, event, helpers, imports }) {
  // On document display html value updated used for certification policy type instructions
  const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();

  if (!event.payload) return;

  var { policyData } = api.state;
  const { value } = event.payload;

  if (event.elementId === "instructions_document_display") {
    policyData.options.instructions = value;
    api.setState("policyData", cloneDeep(policyData));
  }
}
