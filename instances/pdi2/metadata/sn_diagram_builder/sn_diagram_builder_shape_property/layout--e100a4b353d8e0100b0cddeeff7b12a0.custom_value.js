function getValue(go, dispatch, $) {
    return $(go.TreeLayout, {
        isRealtime: false,
        angle: 90,
        nodeSpacing: 100,
        layerSpacing: 80,
        alternateAngle: 90
    });
}
