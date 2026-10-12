/*
	Check whether or not we can publish the template.
*/
function transform(input) {
	var result = true;
	var templateSysId = input.templateSysId;

	var requiredAttributes = ['name', 'table', 'master_ci_option', 'merge_relations', 'merge_related_items', 'duplicate_ci_action'];
	/*
		Check if the required attributes are set
	*/

	/*
		Abhishek's check for missing requirements in Java layer:

		private static final List<String> fRequiredAttributes = 
		List.of(NAME, TABLE, MASTER_CI_OPTION, MERGE_RELATIONS, MERGE_RELATED_ITEMS, DUPLICATE_CI_ACTION);
		List<String> missingAttributes = Lists.newArrayList();

		GlideRecord gr = new GlideRecord(RECONCILE_DUPLICATE_TEMPLATE);
		if (gr.get(fTemplateId)) {
			fRequiredAttributes.forEach(attribute -> {
				if (StringUtil.nil(gr.getValue(attribute))) {
					missingAttributes.add(attribute);
				}
			});
		}
		return missingAttributes;
	*/

	var gr = new GlideRecord('reconcile_duplicate_template');
	if (gr.get(templateSysId)) {
		requiredAttributes.forEach(function(attribute) {
			var attributeValue = gr.getValue(attribute);
			if (!attributeValue) {
				 result = false;
			}
		});
	}

	return result;
}
