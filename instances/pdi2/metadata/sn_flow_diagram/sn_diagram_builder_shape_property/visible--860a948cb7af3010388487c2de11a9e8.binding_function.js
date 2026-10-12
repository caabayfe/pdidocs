function getBinding(go, source, target, dispatch) {
	return new go.Binding(target, "", function(graphObject) {
		var diagram = graphObject.diagram || { isReadOnly: false };
		if(diagram.isReadOnly === true)
			return false;

		var data = graphObject.data || { addBtnVisibility: "onHover" };
		switch (data.addBtnVisibility) {
			case "always":
			case "onHover":
				return true;
			case "never":
				return false;
		}
	}).ofObject();
}
