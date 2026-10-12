var gr = new GlideRecord('topic');
    gr.addNullQuery('template');
    gr.query();
    while(gr.next()){
	  gr.setValue('template','4fb26c9cc3d030102ec1a589a840ddbd');
	  gr.update();
}
