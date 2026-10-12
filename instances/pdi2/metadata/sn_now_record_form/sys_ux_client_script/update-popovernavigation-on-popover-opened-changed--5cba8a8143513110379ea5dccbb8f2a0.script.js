function script({api, event}) {
	if (!api.state.popoverNavigation)
		return;
	const { closed = true } = event.payload || {};
	api.setState('popoverNavigation', {
		...api.state.popoverNavigation,
		popover: { closed }
	});
}
