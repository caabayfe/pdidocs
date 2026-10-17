/**
 * playbookActivityUIUtils
 * @return {{setFormFieldItems: (function(api, event): void)}}
 */
function include() {
	const setFormFieldItems = (api, event) => {
		const {
			payload: { formFieldItems = {} }
		} = event;
		const filtered = [];

		for (const name in formFieldItems) {
			const field = formFieldItems[name];
			const dictionaryType =
				(field.dictionary && field.dictionary.type) || null;
			if (dictionaryType) filtered.push(field);
		}

		if (filtered.length) api.setState('formFieldItems', filtered);
	};

	return {
		setFormFieldItems: setFormFieldItems
	};
}
