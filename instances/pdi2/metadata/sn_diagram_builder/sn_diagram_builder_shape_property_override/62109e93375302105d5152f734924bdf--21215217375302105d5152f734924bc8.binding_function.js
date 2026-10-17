function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(_isPaletteNode) {
        return _isPaletteNode ?
            'not-allowed':
			'pointer';
    }).ofModel();
}
