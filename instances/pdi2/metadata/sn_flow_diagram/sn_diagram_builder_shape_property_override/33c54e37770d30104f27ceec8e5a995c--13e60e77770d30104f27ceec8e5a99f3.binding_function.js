function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(labelColor) {
        if (labelColor) {
            const darkestIndex = '5';
            let resolvedColor = resolveThemeVariable(labelColor + darkestIndex);
			// If no resolved color, use fallback
			if (!resolvedColor) {
				return labelColor.includes('purple') ? "#422B52" : "#0D4448"; // if not purple, then teal
			} else {
				return resolvedColor;
			};
        } else {
            return resolveThemeVariable("--now-color_grouped--gray-5") || "#393C3C";
        }
    });
}
