function getBinding(go, source, target, dispatch) {
    return new go.Binding(target, "", function(data, node) {
        var commentHeight = 30;
        var offsetHeight = 0;

        if (data.onAddAnnotation && data.comment == "") {
            offsetHeight += commentHeight;
        } else if (data.comment && data.comment != "") {
            offsetHeight += commentHeight;
        }

        return new go.Spot(0.5, 1, 0, offsetHeight);

    });
}
