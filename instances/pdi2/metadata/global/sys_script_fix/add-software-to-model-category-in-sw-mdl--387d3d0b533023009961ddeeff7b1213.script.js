addSoftwareToModelCategoryInSoftwareModel();

function addSoftwareToModelCategoryInSoftwareModel() {
	var MODEL_CATEGORY_SOFTWARE = 'eefe7854c3031000b959fd251eba8f1e';
	var gr = new GlideRecord('cmdb_software_product_model');
	gr.query();
	while (gr.next()) {
		var modelCatList = gr.getValue('cmdb_model_category');
		if (gs.nil(modelCatList)) {
			gr.setValue('cmdb_model_category', MODEL_CATEGORY_SOFTWARE);
			gr.setWorkflow(false);
			gr.update();
		} else if (!modelCatList.includes(MODEL_CATEGORY_SOFTWARE)) {
			gr.setValue('cmdb_model_category', modelCatList + ',' + MODEL_CATEGORY_SOFTWARE);
			gr.setWorkflow(false);
			gr.update();
		}
	}
}
