function policy(args) {
    const {
        properties,
        trigger,
		api
    } = args;
    if (trigger == null || trigger === "mode") {
    	api.updateVisibility("refreshToken", properties.mode === "preview");
    }
}
