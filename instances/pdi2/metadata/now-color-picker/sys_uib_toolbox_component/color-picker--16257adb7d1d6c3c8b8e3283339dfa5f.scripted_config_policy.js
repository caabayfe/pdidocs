function policy(args) {
    var trigger = args.trigger;
    var api = args.api;
    var properties = args.properties;

    if (!trigger || trigger === "showCustomColors") {
        const showCustomColors = properties.showCustomColors === true;
        api.updateVisibility('customColors', showCustomColors);
    }
}
