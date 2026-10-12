function script({ api, event, helpers }) {
  const { policyData, displayFieldSelections, certificationFieldSelections } =
    api.state;
  let viewportConfig = {};
  if (event.payload.id == "edit_display_fields") {
    viewportConfig = {
      viewportElementId: "viewport_4",
      route: "certification-fields-selection",
      fields: {
        table: policyData.data_filter.table,
        isDisplayFieldSelection: true,
        selectedFields: displayFieldSelections,
        restrictedFields: policyData.options.certification_fields,
        timestamp: new Date(),
      },
    };
  } else if (event.payload.id == "edit_certification_fields") {
    viewportConfig = {
      viewportElementId: "viewport_4",
      route: "certification-fields-selection",
      fields: {
        table: policyData.data_filter.table,
        isDisplayFieldSelection: false,
        selectedFields: certificationFieldSelections,
        restrictedFields: policyData.options.display_fields,
        timestamp: new Date(),
      },
    };
  }
  api.emit("MACROPONENT_VIEWPORT_LOAD_REQUESTED", viewportConfig);
  helpers.modal.open("certification_field_selection_modal");
}
