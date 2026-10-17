function handler({api, event, helpers, imports}) {
    api.emit("CONTENT_UPDATED", {title:event.payload.value});
}
