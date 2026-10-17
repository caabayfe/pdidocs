function script({api, event}) {
    const id = event.payload.data?.output;
    api.setState("importCertSchsProgressId", id);
}
