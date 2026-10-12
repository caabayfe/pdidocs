function script({api, event}) {
	const mode = api.state.activityStreamLayout;
	const { payload: { recommendedMode, canSwitchMode } } = event;
	api.setState('isSideBySideEnabled', recommendedMode === 'side-by-side' && mode === '', false);
	api.setState('isSideBySideAvailable', canSwitchMode);
}
