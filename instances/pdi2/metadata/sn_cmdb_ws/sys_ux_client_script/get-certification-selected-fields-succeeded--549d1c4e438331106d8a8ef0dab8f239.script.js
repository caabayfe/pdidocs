function script({ api, event }) {
  const { policyData } = api.state;
  const {
    displayFieldOptions,
    certificationFieldOptions,
    displayFieldSelections,
    certificationFieldSelections,
  } = event.payload.data.output;
  api.setState("displayFieldOptions", displayFieldOptions);
  api.setState("certificationFieldOptions", certificationFieldOptions);
  if (policyData.options.display_fields)
    api.setState("displayFieldSelections", displayFieldSelections);
  else api.setState("displayFieldSelections", []);
  if (policyData.options.certification_fields)
    api.setState("certificationFieldSelections", certificationFieldSelections);
  else api.setState("certificationFieldSelections", []);
}
