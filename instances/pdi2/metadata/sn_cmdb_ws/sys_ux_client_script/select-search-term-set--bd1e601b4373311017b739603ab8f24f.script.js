function script({api, event, helpers}) {
    var searchTerm = event.payload.value;
    if (searchTerm && searchTerm.length > 2)
        api.setState("searchTerm", searchTerm);
    else
        api.setState("searchTerm", "");
}
