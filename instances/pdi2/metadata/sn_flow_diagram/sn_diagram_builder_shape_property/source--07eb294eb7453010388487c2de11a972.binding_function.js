function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(icon) {
		if (!icon)
			return "/images/snow-icon-round.svg";
		return icon;
	});
}
