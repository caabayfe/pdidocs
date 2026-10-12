function onLoad() {
    if (g_form.isNewRecord())
        g_form.setValue('layout', "// You can either update the TreeLayout configuration or re-implement your own layout.    function getLayout($, go, dispatch) {      return $(go.TreeLayout, {      angle: 90,      nodeSpacing: 100,      layerSpacing: 120,      alternateAngle: 90,      setsChildPortSpot: false,      setsPortSpot: false,     });}");
};
