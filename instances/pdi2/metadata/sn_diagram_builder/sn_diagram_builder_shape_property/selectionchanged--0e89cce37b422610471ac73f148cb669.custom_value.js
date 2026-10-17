function getValue(go, dispatch, $, shapeTemplateUtilities, resolveThemeVariable) {
    return link => link.layerName = link.isSelected ? "Foreground" : "";
}
