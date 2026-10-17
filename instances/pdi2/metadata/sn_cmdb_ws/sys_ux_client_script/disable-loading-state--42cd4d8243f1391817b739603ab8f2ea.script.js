function script({ api, event, helpers }) {
    // timeout adds a bit of padding after the data broker has finished loading to set the form state before the loader is dismissed
    helpers.timing.setTimeout(() => {
        api.emit("NOW_UXF_PAGE#SET_LOADING_STATE", {
            loading: false,
        });
    }, 500);
}
