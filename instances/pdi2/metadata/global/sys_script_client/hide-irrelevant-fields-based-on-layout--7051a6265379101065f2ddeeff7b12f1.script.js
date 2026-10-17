function onLoad() {
	var stepType = g_scratchpad.step_type;

	// set type to step type
	if (stepType) {
		g_form.setValue("type", stepType);
		g_form.setReadOnly("type", true);
	}
	var fieldsToHide = {
		text : ["image_alt", "image", "video_link", "has_image_link","video_alt","image_link"],

		image_text : ["video_link", "image_link", "video_alt"],

		question : ["has_image_link", "video_link", "video_alt", "image_link", "image", "image_alt", "text"],

		image_question : ["image_link", "video_link", "video_alt", "text", "has_custom_html"],

		image : ["video_link", "video_alt", "text", "image_link"],

		video : ["has_image_link", "image", "text", "image_link", "image_alt",],
	};

	switch(stepType) {
		case "text" :
			g_form.setMandatory("text", true);
			hideFields(fieldsToHide.text);
			break;
		case "image_text" :
			hideFields(fieldsToHide.image_text);
			break;
		case "question" :
			hideFields(fieldsToHide.question);
			break;
		case "image_question" :
			hideFields(fieldsToHide.image_question);
			break;
		case "image" :
			hideFields(fieldsToHide.image);
			break;
		case "video" :
			hideFields(fieldsToHide.video);
			break;
	}
}

function hideFields(fields) {
	fields.forEach(function(field) {
		// Can't hide Mandatory fields.
		g_form.setMandatory(field, false);
		g_form.setDisplay(field, false);
	});
}
