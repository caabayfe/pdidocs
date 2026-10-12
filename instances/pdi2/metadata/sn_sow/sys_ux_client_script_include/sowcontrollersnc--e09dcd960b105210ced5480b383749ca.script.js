function include({imports}) {
	const OVERVIEW_ICONS = {
		expand: 'chevron-up-outline',
		collapse: 'chevron-down-outline'
	};
	class SOWControllerSNC {
		constructor (props) {
			this.props = props;
		}

		getValidFields (requiredFields) {
			requiredFields = requiredFields ? requiredFields : this.props.requiredFields;
			let fields = requiredFields.map(fieldName => {
				let propsField = this.props.fields[fieldName];
				let fieldValue = {};
				if (propsField) {
					fieldValue.label = `${propsField.label}${propsField.mandatory ? ' *' : ''}`;
					fieldValue.value = {
						"type": (propsField.type === "html") ? "html" : "string",
						"value": propsField.displayValue ? propsField.displayValue : '--'
					};
				}
				return fieldValue;
			});

			let validFields = fields.filter(function(field) {
				return JSON.stringify(field) !== "{}";
			});
			return validFields;
		}

		getSectionValues (fieldNames) {
			let hideButton = fieldNames ? this.shouldHideCTA(null, fieldNames) || (this.props.isReadOnly) : true;
			let expand = this.props.expandSection;
			if (expand && !hideButton)
				expand = false;
		
			return {
				hideButton,
				expand,
				icon: expand ? OVERVIEW_ICONS.expand : OVERVIEW_ICONS.collapse
			};
		}

		shouldHideCTA(fields, fieldNames) {
			fields = !fields ? this.props.fields : fields;
			const arrFieldNames = fieldNames.split(',');
			let hasValue = false;
			for (const fieldName of arrFieldNames) {
				const value = fields[fieldName] ? fields[fieldName].value + '' : null;
				hasValue = value !== null && value !== '';
				if (hasValue)
					break;
			};
			return hasValue;
		}		

		async toggleSection({ event, sectionState, helpers }) {
			const {elementId} = event;
			const expandSection = sectionState.expanded;
			const editable = elementId === 'add_button' ? true : sectionState.isEdit;
			const icon = expandSection ? OVERVIEW_ICONS.collapse : OVERVIEW_ICONS.expand;
			const iconLabel = expandSection ? await helpers.translate("Expand container") : await helpers.translate("Collapse container");
			return {
				...sectionState,
				icon: icon,
				isEdit: editable,
				label: iconLabel,
				expanded: !expandSection
			};
		}
	}
	return SOWControllerSNC;
}
