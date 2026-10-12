function getValue(go, dispatch, $) {
	return function(e, obj, prev) {
		dispatch("FLOWDIAGRAM_DATA#INOUT_NODE_CLICKED");
	}
}
