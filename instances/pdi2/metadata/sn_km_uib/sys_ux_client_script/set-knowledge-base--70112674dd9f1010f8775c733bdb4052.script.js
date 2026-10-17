function handler({api, event, imports}) {
    var kb =event.payload.item? event.payload.item.id:'';
    api.setState("knowledge_base",kb);
    api.setState("template","");
}
