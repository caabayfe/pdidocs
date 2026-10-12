function getValue(go, dispatch, $) {
	return function(e, obj, prev) {
		dispatch("FLOW_DIAGRAM#SELECT_STAGE_CLICKED");
	};
}
