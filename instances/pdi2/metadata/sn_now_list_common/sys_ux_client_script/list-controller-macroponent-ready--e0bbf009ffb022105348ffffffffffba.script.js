function script({
    api,
    event,
    imports
}) {
    const { layouts, displayedLayout } = api.context.props;
    if(!layouts) return;
    if (layouts.includes('list') && layouts.includes('gallery')) {
        const layout = api.context?.session?.userPrefs?.displayLayoutPreference;
        if (layout) {
          api.setState('displayedLayout', layout);
        }
    } else if (!layouts.includes(displayedLayout)) {
        // if the displayed layout is not in the layouts, set the one present in layouts as the displayed layout
        api.setState('displayedLayout', layouts);
    }
}
