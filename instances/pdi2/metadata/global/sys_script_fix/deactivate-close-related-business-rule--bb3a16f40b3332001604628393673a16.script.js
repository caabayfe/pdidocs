var gr = new GlideRecord('sys_script');
if(gr.get('1df059ffc61122750121f956646103c5')){
	gr.setValue('active', false);
	gr.update();
}
