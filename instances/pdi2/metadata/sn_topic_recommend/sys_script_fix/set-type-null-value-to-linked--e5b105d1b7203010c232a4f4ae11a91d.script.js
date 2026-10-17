var gr = new GlideRecord('sn_topic_recommend_topic_linking');
gr.addNullQuery('type');
gr.query();
while (gr.next()) {
	gr.setValue('type', 'linked');
	gr.update();
}
