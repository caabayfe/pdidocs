addStockroomModelRelation();

function addStockroomModelRelation() {
	var gr = new GlideRecord("alm_m2m_stockroom_model");
	gr.addQuery("model", current.model);
	gr.addQuery("stockroom", current.stockroom);
	gr.query();

	if (!gr.hasNext()) {
		gr = new GlideRecord("alm_m2m_stockroom_model");
		gr.initialize();
		gr.model = current.model;
		gr.stockroom = current.stockroom;
		gr.insert();
	}
}
