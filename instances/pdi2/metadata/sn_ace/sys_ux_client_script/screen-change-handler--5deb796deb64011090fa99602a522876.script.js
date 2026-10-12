function script({api, event}) {
    if (event.payload.selectedContent && event.payload.selectedContent.route) {
        api.setState('currentRoute', event.payload.selectedContent.route);
        api.setState('selectedContent', event.payload.selectedContent);
    }
}
