var gr = new GlideRecord('sys_cs_topic');
gr.addEncodedQuery('sys_id=ce2ee85053130010cf8cddeeff7b12bf^ORsys_id=b18df45853130010cf8cddeeff7b12fd');
gr.query();
while(gr.next()){
    if(!gr.visible){
	    gr.setValue('visible', true);
	    gr.update();
	}
}
