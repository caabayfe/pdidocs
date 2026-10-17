function onCondition() {
	var annotationTr = $j("#format-json-annotation");
	if (annotationTr) {
		annotationTr.each(function() {
			$(this).style.display = "none";
		});
	} 
}
