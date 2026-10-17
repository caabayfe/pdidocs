(function executeRule(current, previous /* null when async */) {
	var itemViewToParse = current.item_view_json;
	
	try {
		var elementProcessor = new ItemViewElementProcessor();
		current.item_view_json = elementProcessor.identifyItemViewElements(itemViewToParse);
		setDependencyFields();
	} catch (err) {
		gs.addErrorMessage(gs.getMessage('Error while processing itemView: {0}', err.message));
		current.setAbortAction(true);
	}
	
	function setDependencyFields(){
		elementList = elementProcessor.getItemViewElementsIds(current.item_view_json);
		var dependency_fields = [];
		for(var index=0;index<elementList.length;index++) {
			if(!elementList[index].cellId && !elementList[index].titleCellId && !elementList[index].subtitleCellId)
				continue;
			
			if(elementList[index].cellId)
				dependency_fields.push(elementList[index].cellId+"-"+elementList[index].id);
			
			if(elementList[index].titleCellId)
				dependency_fields.push(elementList[index].titleCellId+"-"+elementList[index].id);
			
			if(elementList[index].subtitleCellId)
				dependency_fields.push(elementList[index].subtitleCellId+"-"+elementList[index].id);
			
		}
		
		current.dependency_fields = dependency_fields.join(",");
	}
	
})(current, previous);
