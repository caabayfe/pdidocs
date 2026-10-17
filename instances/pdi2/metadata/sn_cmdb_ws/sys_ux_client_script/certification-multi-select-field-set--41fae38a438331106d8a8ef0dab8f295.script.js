function script({ api, event, helpers, imports }) {
  const { elementId } = event;
  const { value } = event.payload;
  const { policyData, displayFieldOptions, certificationFieldOptions, validatorModel } =
    api.state;
  var updatedPolicyData = policyData;
  const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();
  var selectedFields = "";

  // First, fillter out items that are disabled, because they shouldn't have been selected
  var disabled = [];
  for (var i = 0; i < value.length; i++) {
    if (value[i].disabled)
      disabled.push(i);
  }
  for (var i = disabled.length - 1; i >= 0; i--) {
    value.splice(disabled[i], 1);
  }

  for (var i = 0; i < value.length; i++) {
    selectedFields += value[i]["id"] + ",";
  }

  if (elementId == "display_fields_typeahead") {
    updatedPolicyData.options.display_fields = selectedFields.slice(0, -1);

    certificationFieldOptions.forEach((fieldOption) => {
      const isSelected = value.find((selectedField) => selectedField.id === fieldOption.id);
      if (isSelected) {
        fieldOption.disabled = true;
      } else {
        fieldOption.disabled = false;
      }
    });

    api.setState("displayFieldSelections", value);
    api.setState("certificationFieldOptions",cloneDeep(certificationFieldOptions));

    if (validatorModel?.options?.display_fields) {
      if (selectedFields.length > 0) {
        validatorModel["options"]["display_fields"]["invalid"] = false;
      } else {
        validatorModel["options"]["display_fields"]["invalid"] = true;
      }
      api.setState("validatorModel", cloneDeep(validatorModel));
    }

  } else if (elementId == "certification_fields_typeahead") {
    updatedPolicyData.options.certification_fields = selectedFields.slice(0,-1);

    displayFieldOptions.forEach((fieldOption) => {
        const isSelected = value.find((selectedField) => selectedField.id === fieldOption.id);
        if (isSelected) {
          fieldOption.disabled = true;
        } else {
          fieldOption.disabled = false;
        }
      });
    
    api.setState("certificationFieldSelections", value);
    api.setState("displayFieldOptions", cloneDeep(displayFieldOptions));

    if (validatorModel?.options?.certification_fields) {
      if (selectedFields.length > 0) {
        validatorModel["options"]["certification_fields"]["invalid"] = false;
      } else {
        validatorModel["options"]["certification_fields"]["invalid"] = true;
      }
      api.setState("validatorModel", cloneDeep(validatorModel));
    }
  }

  api.setState("policyData", cloneDeep(updatedPolicyData));
}
