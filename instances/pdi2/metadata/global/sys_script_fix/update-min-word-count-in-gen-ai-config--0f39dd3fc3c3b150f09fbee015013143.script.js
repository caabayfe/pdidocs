var gr = new GlideRecord("sys_generative_ai_config");
gr.addNullQuery("min_word_count");
gr.query();
while(gr.next()){
	gr.setValue("min_word_count","-1");
	gr.update();
}
