function onCondition() {
	var annotation = gel('iife_description');
	if(annotation) {
		var formGroup = $(annotation).up('.form-group');
		if (formGroup)
			formGroup.setStyle({display: 'block'});
	}
}
