function transform(input) {
    if (input) {
        var aceUtil = new global.ACEAppBuilderGlobalScopedUtil();
        if (input.payload.name === "Tables Drop Down")
            aceUtil.updateRecord("sys_user_preference", "cc49485a87530110a4a2c077f6cb0b04", {
                value: input.payload.value
            });
        else if (input.payload.name === "Days Drop Down")
            aceUtil.updateRecord("sys_user_preference", "cb99485a87530110a4a2c077f6cb0b25", {
                value: input.payload.value
            });
    }
    return {};

}
