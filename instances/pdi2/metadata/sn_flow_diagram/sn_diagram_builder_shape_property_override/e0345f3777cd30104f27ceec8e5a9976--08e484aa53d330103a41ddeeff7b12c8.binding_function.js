function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, source, function(labelAlignmentFocus) {
		switch (labelAlignmentFocus) {
			case "Left":
				return go.Spot.Left;
			case "Top":
				return go.Spot.Top;
			default:
				return go.Spot.Center;
		}
	});
}
