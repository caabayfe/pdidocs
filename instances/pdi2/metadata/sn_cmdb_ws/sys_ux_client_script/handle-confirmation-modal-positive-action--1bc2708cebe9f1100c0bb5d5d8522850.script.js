function script({api, event, helpers}) {
    api.emit("NOW_SELECT#SELECTED_ITEM_SET", {
        value: api.state.selectItemEventPayload.value,
       name: api.state.selectItemEventPayload.name,
       item: api.state.selectItemEventPayload.item
    });
     api.setState("selectItemEventPayload", null);
}
