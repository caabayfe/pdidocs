function script({ api, event, helpers }) {
  const newTable = event.payload.value;
  const oldTable = api.state.policyData.data_filter.table;
  api.setState("selectedPolicyTable", newTable);
  if (
    newTable !== oldTable &&
    api.state.policyData.assignment.task_assignment_type != ""
  ) {
    api.setState("selectItemEventPayload", {
      name: "data_filter:table",
      value: event.payload.value,
      item: event.payload.item,
    });
    helpers.modal.open("confirm_table_change");
  }
}
