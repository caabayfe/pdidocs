function transform(input) {
	if(input.expKey && input.variantID) {
		gs.getSession().putClientData('experiment_override_' + input.expKey, input.variantID);
		return 'success';
	}

	return 'failed';
}
