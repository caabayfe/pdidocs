function onLoad() {
	addLateLoadEvent(function() {
		var annotationTr = $j("#format-json-annotation-span").closest('tr');
		if (annotationTr) {
			if (g_form.getControl('format').value === 'JSON')
				annotationTr.css("display", "table-row");
			else
				annotationTr.css("display", "none");
			annotationTr.attr("id", "format-json-annotation");
		}
	});
}
