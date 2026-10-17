function getValue(go, dispatch, $) {
    return function(e, obj) {
        obj.background = null;
        var opacity = 0;
        if (obj?.part?.data?.showContextMenu) {
            opacity = 1;
        }
        obj.opacity = opacity;
    };
}
