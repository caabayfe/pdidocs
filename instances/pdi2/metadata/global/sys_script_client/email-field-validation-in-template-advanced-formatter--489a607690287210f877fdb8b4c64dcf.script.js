function onSubmit() {
  function validateUpdateToAndContentPlacement(arr) {
	var hasNonEmptyUpdateTo = false;
	var hasNonEmptyContentPlacement = false;
	var i, obj, v;

	for (i = 0; i < arr.length; i++) {
		obj = arr[i];
		if (obj.hasOwnProperty('update_to')) {
			v = obj.update_to;
			if (typeof v === 'string' && v.trim() !== '') {
				hasNonEmptyUpdateTo = true;
			}
		}
		if (obj.hasOwnProperty('content_placement')) {
			v = obj.content_placement;
			if (typeof v === 'string' && v.trim() !== '') {
				hasNonEmptyContentPlacement = true;
			}
		}
	}

	if (!hasNonEmptyUpdateTo && !hasNonEmptyContentPlacement) {
		return true;
	}

	return hasNonEmptyUpdateTo && hasNonEmptyContentPlacement;
}

    var template_v2 = g_form.getValue('template_v2');
    if (template_v2) {
        let parsedTemplate;
        try {
            parsedTemplate = JSON.parse(template_v2);
        } catch (e) {
            return true; // Invalid JSON, skip validation
        }
        if (!validateUpdateToAndContentPlacement(parsedTemplate)) {
			var headerText = getMessage('Fill in email details?');
			var bodyText = getMessage('Please fill in both email content and content placement, or leave both empty.');
            g_modal.confirm(headerText, bodyText);
            return false;
        }
    }
   return true
}
