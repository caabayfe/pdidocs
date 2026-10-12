function generateDescription() {
		var descriptionGenerator = new ATFStepDescriptionGenerator();
		var record = step.inputs.record_id.getDisplayValue();
		var assertType = step.inputs.assert_type;
		var description;

		var isRelatedList = !(step.inputs.list_type == 'list');

		if (isRelatedList) {
			var relatedListUtil = new ATFRelatedListUtil();
			var relatedListLabel = relatedListUtil.getRelatedListLabels(step.inputs.table, step.inputs.related_list);
		}

		var formTd = GlideTableDescriptor.get(step.inputs.table);
		var formTable = step.inputs.table;
		if (formTd)
			formTable = formTd.getLabel();

		if (assertType == 'no_record_present') {
			if (isRelatedList)
				description = gs.getMessage("Validate that the record '{0}' is not present in the '{1}' related list on the '{2}' form", [record, relatedListLabel, formTable]);
			else
				description = gs.getMessage("Validate that the record '{0}' is not present in the '{1}' list", [record, formTable]);
		} else {
			if (isRelatedList)
				description = gs.getMessage("Validate that the record '{0}' is present in the '{1}' related list on the '{2}' form", [record, relatedListLabel, formTable]);
			else
				description = gs.getMessage("Validate that the record '{0}' is present in the '{1}' list", [record, formTable]);
		}
		description += descriptionGenerator.getTimeoutDescription(step.timeout);

		if (step.warning_message)
			description += "\n\n" + step.warning_message;

		return description;
		}
generateDescription();
