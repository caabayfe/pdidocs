var GetChoices = Class.create();
GetChoices.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getChoiceOptions: function() {
		var resultObj = {};
		
		var tableName = this.getParameter('sysparm_table_name');
		var fieldName = this.getParameter('sysparm_field_name');
		var fetchSubfield = this.getParameter('sysparm_fetch_subfield');
		var dependentValue = this.getParameter('sysparm_dependent_value');
		
                var gr = new GlideRecord(tableName);
		if (!gr.canRead())
			return new global.JSON().encode(resultObj);

		// Get choice list for given field
		var clg = new GlideChoiceListGenerator(tableName, fieldName, dependentValue);
        var choiceListObj = clg.get();
		//var choiceListObj = GlideChoiceList.getChoiceList(tableName, fieldName, dependentValue);
		var choiceListSize = choiceListObj.getSize();
		resultObj.choices = [];
		for (var i = 0; i < choiceListSize; i++){
			var choice = choiceListObj.getChoice(i);
			resultObj.choices.push({
				"label": choice.getLabel(),
				"value": choice.getValue()
			});
		}
		
		if (fetchSubfield) {
			resultObj.subFields = [];
		
			// Also get the choice fields dependent on this field
			gr = new GlideRecord(tableName);
			var elements = gr.getElements();

			// Scoped vs Global calls to getElements returns different objects
			var elementsLength = elements.size();
			for (var j = 0; j < elementsLength; j++) {
			
				var element = elements.get(j).getED();
				if (!element.isChoiceTable())
					continue;
			
				var dependent = '' + elements.get(j).getDependent();
			
				if (dependent === '' + fieldName) {
					resultObj.subFields.push({
						"label": element.getLabel(),
						"value": element.getName()
					});
				}
			}
		}
		
        return new global.JSON().encode(resultObj);
    },
	
    type: 'GetChoices'
});
