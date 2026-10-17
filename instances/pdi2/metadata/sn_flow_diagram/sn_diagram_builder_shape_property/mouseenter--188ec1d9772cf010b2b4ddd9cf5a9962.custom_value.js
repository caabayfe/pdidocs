function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return function(e, obj) {
        var nowColorBackground = resolveThemeVariable("--now-color_background--tertiary-actionable") || "#32343A";
        var opacity = 0;
        if (obj?.part?.data?.showContextMenu) {
            opacity = resolveThemeVariable("--now-opacity--less") || 0.25;
        }

        var opacityBase16 = Math.floor(opacity * 255).toString(16).padStart(2, '0');
        obj.background = nowColorBackground + opacityBase16;
    };
}
