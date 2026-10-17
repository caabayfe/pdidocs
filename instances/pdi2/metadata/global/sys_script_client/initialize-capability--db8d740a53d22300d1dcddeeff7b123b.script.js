function onLoad() {
   //Type appropriate comment here, and begin script below
	var view = getView();
	if (view == 'classification') {
		g_form.setValue('name','classification_trainer');
	} else if(view == 'similarity') {
		g_form.setValue('name','similarity_trainer');
	} else if(view == 'clustering'){
		g_form.setValue('name','clustering_trainer');
	}
	g_form.setReadOnly('name',true);
}
