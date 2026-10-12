(function() {
	var gr = new GlideRecord('sys_sg_item_view');
	gr.query();
	while (gr.next()) {
		var itemViewJson = gr.getValue('item_view_json');
		if (!itemViewJson)
			continue;

		try {
			var elementProcessor = new ItemViewElementProcessor();
			var item_view_json = elementProcessor.identifyItemViewElements(itemViewJson);
			gr.setValue('item_view_json', item_view_json);
			setDependencyFields(gr, item_view_json);
			var result = gr.update('Add identifiers to item view JSON');
			if (result)
				gs.warn(gs.getMessage('ItemView {0} updated successfully', gr.getUniqueValue()));
		} catch (err) {
			gs.warn(gs.getMessage('Error while processing ItemView {0}: {1}', [gr.getUniqueValue(), err.message]));
		}
	}

	gs.warn(gs.getMessage('Execution finished'));
	
	function setDependencyFields(glideRecord, item_view_json){
		elementList = elementProcessor.getItemViewElementsIds(item_view_json);
		var dependency_fields = [];
		for(var index=0;index<elementList.length;index++) {
			if(!elementList[index].cellId)
				continue;
			
			dependency_fields.push(elementList[index].cellId+"-"+elementList[index].id);
		}
		glideRecord.dependency_fields = dependency_fields.join(",");
	}	
	
})();
