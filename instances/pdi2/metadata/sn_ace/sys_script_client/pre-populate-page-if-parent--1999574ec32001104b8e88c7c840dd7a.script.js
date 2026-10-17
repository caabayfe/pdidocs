function onLoad() {
	//Type appropriate comment here, and begin script below
	if(g_form.getValue('parent')){
		g_form.getReference('parent', function(gr){
			g_form.setValue('page', gr.page.toString());
		});
	}
}
