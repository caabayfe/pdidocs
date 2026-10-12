function script({ api, event, imports, helpers }) {
  const { action, selectedItem } = event.payload;
  const {
    policyData,
    displayFieldSelections,
    displayFieldOptions,
    certificationFieldSelections,
    certificationFieldOptions,
    validatorModel
  } = api.state;
  const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();
  var selectedFields = "";

  const _updateOptions = (selectedFields, options) => {
    const selectedFieldsSet = new Set(selectedFields.map(item => item.id));

    var updatedOptions = options.map(item => ({
      ...item,
      disabled: selectedFieldsSet.has(item.id)
  }));
    return updatedOptions;
  };

  const _mergeReferenceField = (field) => {
    var mergedFieldId = "";
    var mergedFieldLabel = "";
    for (var i = 0; i < field.length; i++) {
      mergedFieldId += field[i]["id"] + ".";
      mergedFieldLabel += field[i]["label"] + ".";
    }
    return {
      id: mergedFieldId.slice(0, -1),
      label: mergedFieldLabel.slice(0, -1),
    };
  };

  const currentCertificationFieldOptions = certificationFieldOptions.reduce(
    (displayFieldObj, field) => {
      displayFieldObj[field.id] = field;
      return displayFieldObj;
    },
    {}
  );

  const currentDisplayFieldOptions = displayFieldOptions.reduce(
    (displayFieldObj, field) => {
      displayFieldObj[field.id] = field;
      return displayFieldObj;
    },
    {}
  );


  if (action == "displayFields") {
    var fieldsSelected = [];
    for (var i = 0; i < selectedItem.length; i++) {
      var displayField;

      if (selectedItem[i].length == 1) {
        displayField = selectedItem[i][0];
      } else {
        displayField = _mergeReferenceField(selectedItem[i]);
      }

      selectedFields += displayField["id"] + ",";
      fieldsSelected.push(displayField);
      if (!currentDisplayFieldOptions[displayField["id"]]) {
        displayFieldOptions.push(displayField);
        certificationFieldOptions.push({ ...displayField, disabled: true });
      }
    }
    policyData.options.display_fields = selectedFields.slice(0, -1);
    api.setState("displayFieldSelections", fieldsSelected);
    api.setState("displayFieldOptions", displayFieldOptions);
    var updatedCertificationFieldOptions = _updateOptions(fieldsSelected, certificationFieldOptions);
    api.setState("certificationFieldOptions", updatedCertificationFieldOptions);
    // If the display fields validator model doesn't exist, create it
    if (!validatorModel?.options?.display_fields) {
      validatorModel.options.display_fields = {
        "invalid": false
      }
    }
    if (fieldsSelected.length > 0) {
      validatorModel["options"]["display_fields"]["invalid"] = false;
    } else {
      validatorModel["options"]["display_fields"]["invalid"] = true;
    }
    api.setState("validatorModel", cloneDeep(validatorModel));
  } else if (action == "certificationFields") {
    var fieldsSelected = [];
    for (var i = 0; i < selectedItem.length; i++) {
      var displayField;

      if (selectedItem[i].length == 1) {
        displayField = selectedItem[i][0];
      } else {
        displayField = _mergeReferenceField(selectedItem[i]);
      }

      selectedFields += displayField["id"] + ",";
      fieldsSelected.push(displayField);
      if (!currentCertificationFieldOptions[displayField["id"]]) {
        certificationFieldOptions.push(displayField);
        displayFieldOptions.push({ ...displayField, disabled: true });
      }
    }
    policyData.options.certification_fields = selectedFields.slice(0, -1);
    api.setState("certificationFieldSelections", fieldsSelected);
    api.setState("certificationFieldOptions", certificationFieldOptions);
    var updatedDisplayFieldOptions = _updateOptions(fieldsSelected, displayFieldOptions);
    api.setState("displayFieldOptions", updatedDisplayFieldOptions);
    // If the certification fields validator model doesn't exist, create it
    if (!validatorModel?.options?.certification_fields) {
      validatorModel.options.certification_fields = {
        "invalid": false
      }
    }
    if (fieldsSelected.length > 0) {
      validatorModel["options"]["certification_fields"]["invalid"] = false;
    } else {
      validatorModel["options"]["certification_fields"]["invalid"] = true;
    }
    api.setState("validatorModel", cloneDeep(validatorModel));
  }
 helpers.modal.close("certification_field_selection_modal");
  api.setState("policyData", cloneDeep(policyData));
}
