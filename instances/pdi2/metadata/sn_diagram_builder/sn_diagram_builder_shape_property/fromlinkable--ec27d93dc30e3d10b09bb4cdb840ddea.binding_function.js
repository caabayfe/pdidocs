function getBinding(go, source, target, dispatch, resolveThemeVariable) {
	var fill = resolveThemeVariable("--now-color--primary-0"); // Syntax to retrieve the value associated with the specified theme variable
	return new go.Binding(target, source);
}
