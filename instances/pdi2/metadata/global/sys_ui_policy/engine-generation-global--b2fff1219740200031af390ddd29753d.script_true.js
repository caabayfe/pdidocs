function onCondition() {
	var eventParm1Annotation = document.getElementById("event_parm_1_annotation");
	if (eventParm1Annotation)
		toggle(eventParm1Annotation, false);
	
	var eventParm2Annotation = document.getElementById("event_parm_2_annotation");
	if (eventParm2Annotation)
		toggle(eventParm2Annotation, false);
}

function toggle(element, visible) {
	element.style.display = visible ? "block" : "none";
}
