function script({api, event}) {
  api.emit(event.payload.wrappedAction, event.payload.wrappedPayload);
}
