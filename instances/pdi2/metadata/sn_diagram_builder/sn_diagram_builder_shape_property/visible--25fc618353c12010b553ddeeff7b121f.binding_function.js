function getBinding(go, source, target, dispatch) {
	return new go.Binding("visible", "_isReadOnly", function(flag) {
            return !flag;
        }).ofModel();
}
