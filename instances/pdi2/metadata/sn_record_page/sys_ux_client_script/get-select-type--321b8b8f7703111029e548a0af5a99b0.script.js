function handler({ api, event, helpers, imports }) {
	return api.context.props.fieldType === 'glide_list' ? 'multi': 'single';
 }
