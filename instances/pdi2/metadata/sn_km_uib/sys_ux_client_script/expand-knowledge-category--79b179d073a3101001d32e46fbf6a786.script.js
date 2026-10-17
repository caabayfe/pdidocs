function handler({
    api,
    event,
    imports
}) {
    api.setState('loadingItems', event.payload.path);
    api.setState('route', event.payload.path);
    api.setState('clickedItemId', event.payload.item.id);
}
