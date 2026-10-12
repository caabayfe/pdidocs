function transform(input) {
	for(var i = 0; i < input.evambroker.items.length; i++){
		var model = input.evambroker.items[i].propValues;
		var currDate = new GlideDateTime();
		var dueDate = new GlideDateTime();
		var price = model.model.price;
		
		var noValueMessage = gs.getMessage("N/A");
		var buttonLabel = model.titleLabel;
		var detailValueOne = model.detailValueOne || noValueMessage;
		var detailValueTwo = model.detailValueTwo || noValueMessage;

		if (model.highlightedHeaderLabel) {
			if (model.detailLabelOne && model.detailLabelTwo) 
				buttonLabel = gs.getMessage(
					"{0}, {1}, {2}: {3}, {4}: {5}",
					[
						model.titleLabel,
						model.highlightedHeaderLabel,
						model.detailLabelOne,
						detailValueOne,
						model.detailLabelTwo,
						detailValueTwo
					]
				);
			else if (model.detailLabelOne)
				buttonLabel = gs.getMessage(
					"{0}, {1}, {2}: {3}",
					[
						model.titleLabel,
						model.highlightedHeaderLabel,
						model.detailLabelOne,
						detailValueOne
					]
				);
			else if (model.detailLabelTwo)
				buttonLabel = gs.getMessage(
					"{0}, {1}, {2}: {3}",
					[
						model.titleLabel,
						model.highlightedHeaderLabel,
						model.detailLabelTwo,
						detailValueTwo
					]
				);
			else
				buttonLabel = gs.getMessage(
					"{0}, {1}",
					[
						model.titleLabel,
						model.highlightedHeaderLabel
					]
				);
		} else if (model.detailLabelOne && model.detailLabelTwo)
			buttonLabel = gs.getMessage(
				"{0}, {1}: {2}, {3}: {4}",
				[
					model.titleLabel,
					model.detailLabelOne,
					detailValueOne,
					model.detailLabelTwo,
					detailValueTwo
				]
			);
		else if (model.detailLabelOne)
			buttonLabel = gs.getMessage(
				"{0}, {1}: {2}",
				[
					model.titleLabel,
					model.detailLabelOne,
					detailValueOne
				]
			);
		else if (model.detailLabelTwo)
			buttonLabel = gs.getMessage(
				"{0}, {1}: {2}",
				[
					model.titleLabel,
					model.detailLabelTwo,
					detailValueTwo
				]
			);
		
		model.buttonLabel = buttonLabel;

		dueDate.setValue(model.model.due_date);
		var dueDateValue = dueDate.getValue();
		if(model.model.table == "sc_req_item"){
			if(model.model.due_date != ""){
				model.highlightedHeaderLabel = gs.getMessage("Completion date: {0}", model.model.due_date);
				if (model.model.due_date.includes('ago')) { 
					model.highlightedHeaderBkgColor = "critical";
				} else if (dueDate.isValid() && currDate.getDisplayValue() > dueDate.getDisplayValue()){
					model.highlightedHeaderBkgColor = "critical";
				} 
			}
			if(model.model.recurring_frequency != null)
				model.subtitle = model.subtitle + " + " + model.model.recurring_price + " " + model.model.recurring_frequency;
			if(price && price.substring(1) == "0.00" && model.model.recurring_frequency == null )
				model.subtitle = " ";
		} else{
			if(model.model.due_date != ""){
				model.highlightedHeaderLabel = gs.getMessage("Completion date: {0}", model.model.due_date);
				if (model.model.due_date.includes('ago')) { 
					model.highlightedHeaderBkgColor = "critical";
				} else if (dueDate.isValid() && currDate.getDisplayValue() > dueDate.getDisplayValue()){
					model.highlightedHeaderBkgColor = "critical";
				} 
			}
		}
	}
	return input;
}
