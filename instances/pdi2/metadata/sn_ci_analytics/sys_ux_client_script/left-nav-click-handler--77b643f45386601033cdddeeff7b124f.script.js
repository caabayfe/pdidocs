function handler({
    api,
    helpers,
    event,
    imports
}) {

    const {
        emit,
        state,
        context: {
            props
        }
    } = api;
    const route = event.payload.item.id || "overview";

    const params = {};
    if (props.startDate && props.endDate) {
        params.startDate = props.startDate;
        params.endDate = props.endDate;
    }
    params.timestamp = Date.now();
    
    emit("NAV_ITEM_SELECTED", {
        route: route,
        params: params,
        redirect: "",
        passiveNavigation: "",
        title: "",
        multiInstField: "",
        external: "",
    });
}
