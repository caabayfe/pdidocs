function onLoad() {
	//Noop
}

addTopRenderEvent(function () { // We want this to run before FieldListElement.onLoad runs in RenderEvent.
	if (FieldListElement) {
		if (FieldListElement._no_expand_patched) {
			jslog('FieldListElement already patched.');
		} else {
			var origF = FieldListElement.prototype._colsReturned;
			FieldListElement.prototype._colsReturned = function (request) {
				var tcols = request.responseXML;
				var items = tcols.getElementsByTagName("item");
				for (var i = 0; i < items.length; i++) {
					var item = items[i];
					if (item.getAttribute("reference"))
						item.setAttribute("reference", '');
				}
				return origF.call(this, request);
			};
			FieldListElement._no_expand_patched = true;
		}
	} else {
		jslog('FieldListElement not found. Could not patch it.');
	}
});
