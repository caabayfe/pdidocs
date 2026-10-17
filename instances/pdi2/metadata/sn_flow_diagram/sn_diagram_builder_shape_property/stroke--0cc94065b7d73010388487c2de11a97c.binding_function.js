function getBinding(go, source, target, dispatch, resolveThemeVariable) {
    return new go.Binding(target, source, function(labelColor) {
        if (labelColor) {
            const lightestIndex = '0';
            let resolvedColor = resolveThemeVariable(labelColor + lightestIndex);
			// If no resolved color, use fallback
			if (!resolvedColor) {
				return labelColor.includes('purple') ? "#EFDEFA" : "#C8F0F3"; // if not purple, then teal
			} else {
				return resolvedColor;
			};
        } else {
            return resolveThemeVariable("--now-color_grouped--gray-0") || "#E8EAEA";
        }
    });
}
