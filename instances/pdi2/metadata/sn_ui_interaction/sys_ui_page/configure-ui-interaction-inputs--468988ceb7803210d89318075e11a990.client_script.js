const invalidFields = new Set();

const interpolationRegex = /{{([\s\S]+?)}}/;

function isValidBinding(value) {
	return typeof value === 'string' && interpolationRegex.test(value);
}

function initializeForm() {
	const inputMap = gel("input_map_form");
	const emptyRequiredFields = inputMap.querySelectorAll(".is-required[style*=\"display: block;\"]");

	emptyRequiredFields.forEach(function (field) {
		invalidFields.add(field.id.split('element.')[1]);
	});

	var saveElm = gel('save_button');
	if (saveElm) saveElm.disabled = !!invalidFields.size;
}

initializeForm();

function onInputMapChange(elementName) {
	const input = gel(elementName);
	if (!input) {
		console.warn('Unable to locate input element for ' + elementName);
		return;
	}

	if (input.dataset.required === "true") {
		var value = input.value;

		// An invalid binding should count as an empty value to register as invalid
		if (input.dataset.type === 'binding' && !isValidBinding(value)) {
			value = '';
		}

		if (value != '') {
			input.changed = true;
			invalidFields.delete(elementName);
		} else {
			invalidFields.add(elementName);
		}

		onChangeLabelProcess(elementName, value);
	}

	var saveElm = gel('save_button');
	if (saveElm) saveElm.disabled = !!invalidFields.size;
}

function onInputMapUseDynamic(elementName, isDynamic) {
	invalidFields.delete(isDynamic ? elementName : elementName + '.binding');

	onInputMapChange(isDynamic ? elementName + '.binding' : elementName);
}

function handleInputMapCancel() {
	GlideModal.get().destroy();
}

function handleInputMapSave(e) {
	GlideModal.get().setPreference('button_action', 'save');
	GlideModal.get().destroy();
}

function handleInputMapClose() {
	GlideModal.get().setPreference('button_action', 'close');
	GlideModal.get().destroy();
}

GlideModal.get().on('closeconfirm', function() {
	const action = GlideModal.get().getPreference('button_action');

	if (action === 'close') {
		return;
	}

	if (action !== 'save') {
		const prevUiInteraction = GlideModal.get().getPreference('sysparm_prev_interaction');
		g_form.setValue('interaction', prevUiInteraction);
		return;
	}

	const form = gel('input_map_form');
	const formData = new FormData(form);

	const inputMap = {};
	for (const [key, value] of formData.entries()) {
		// Ignore internal form logic fields
		if (key.startsWith('sys_display.') || key.startsWith('ni.')) continue;

		const input = gel('input_map.' + key);
		const elm = gel('element.input_map.' + key);

		// Ignore the hidden version of the field,
		// since it can only be static, dynamic, but not both.
		if (elm?.style?.display === 'none') continue;

		// Handle binding values differently than static values
		if (key.endsWith('.binding')) {
			const trueKey = key.split('.binding')[0];
			inputMap[trueKey] = value;
			continue;
		}

		switch (input.dataset.type) {
			case 'boolean': {
				inputMap[key] = value === 'true';
				break;
			}
			case 'json': {
				try {
					inputMap[key] = JSON.parse(value);
				} catch (e) {
					var gwt = new GwtMessage();
					var invalidJsonMessage = gwt.format(gwt.getMessage('Invalid JSON set on UI interaction input: {0}', key));
					g_form.addErrorMessage(invalidJsonMessage);
				}
				break;
			}
			default: {
				inputMap[key] = value;
			}
		}
	}

	g_scratchpad.interaction = g_form.getValue("interaction");
	g_form.setValue('interaction_input_map', JSON.stringify(inputMap, null, 4));
	if (!g_form.isNewRecord()) {
		g_form.save();
	}
});
