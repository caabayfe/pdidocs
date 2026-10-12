function getValue(go, dispatch, $) {
	return function(e, obj, prev) {
		dispatch("FLOW_DIAGRAM#CLOSE_STAGE_CLICKED", {data: obj.panel.part.data});
	}
}
