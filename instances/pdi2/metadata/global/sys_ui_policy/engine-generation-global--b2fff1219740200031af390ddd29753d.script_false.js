function onCondition() {
	var eventParm1Annotation = document.getElementById("event_parm_1_annotation");
	if (eventParm1Annotation)
		toggle(eventParm1Annotation, true);
	
	var eventParm2Annotation = document.getElementById("event_parm_2_annotation");
	if (eventParm2Annotation)
		toggle(eventParm2Annotation, true);
}

function toggle(element, visible) {
	element.style.display = visible ? "block" : "none";
}
