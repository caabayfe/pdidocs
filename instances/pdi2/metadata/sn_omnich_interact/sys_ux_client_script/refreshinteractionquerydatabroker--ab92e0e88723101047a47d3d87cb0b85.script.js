function handler({
    api,
    event
}) {
    /*
    Refresh the Interaction Query data broker
    to set the correct Tab Icon
    when the State of the Interaction record updated.
    */
    const eventPayload = event.payload;
    if (!eventPayload.status && !eventPayload.hasUpdate)
        return;
    // Directy update and live update
    if ((eventPayload.status && eventPayload.status === "updated") || (eventPayload.hasUpdate && eventPayload.hasUpdate === true))
        api.data.interaction_query.refresh();
}
