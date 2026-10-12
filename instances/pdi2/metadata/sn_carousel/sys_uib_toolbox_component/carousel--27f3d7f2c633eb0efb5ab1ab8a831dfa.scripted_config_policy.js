function policy({api, trigger, properties}) { 
	
	const setVisible = (props, value) => {
		props.forEach(prop => {
			api.updateVisibility(prop, value);
		});
	};

	if (!trigger || trigger === 'enableAdvancedNavConfig') {
		setVisible(['navButtonConfig', 'leftNavButtonIcon', 'rightNavButtonIcon'], properties.enableAdvancedNavConfig);
		setVisible(['navStyle'], !properties.enableAdvancedNavConfig);
	} 
	
	if (!trigger || trigger === 'hideTitle')
		setVisible(['carouselTitle', 'badgeConfig', 'titleLevel', 'titleVariant', 'titlePosition', 'disableTextWrapping'], !properties.hideTitle);
	
	if (!trigger || trigger === 'hideLink')
		setVisible(['linkIcon', 'linkText'], !properties.hideLink);
	
	if (!trigger || trigger === 'itemsInView') {
		if (properties.itemsInView == 'multiple-content-items')
			api.updateVisibility('slidingType', true);
		else
			api.updateVisibility('slidingType', false);
	}

	if (!trigger || trigger === 'enableAutoScroll') {
		api.updateVisibility('showCompactView', properties.enableAutoScroll);
		api.updateVisibility('autoScrollSpeed', properties.enableAutoScroll);
		api.updateVisibility('pauseAutoScroll', properties.enableAutoScroll);
		api.updateVisibility('disableLooping', !properties.enableAutoScroll);
	}
}
