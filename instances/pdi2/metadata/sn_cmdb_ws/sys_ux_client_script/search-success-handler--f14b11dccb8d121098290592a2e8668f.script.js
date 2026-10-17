function script({api, event}) {
    api.setState("listItems", event.payload.data.output.records);
 }
