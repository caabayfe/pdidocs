/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({api, trigger, properties}) {
	const isCompactView = properties.isCompactView === true;
	const displayPopover = properties.displayPopover === true;
	const hidePanZoom = properties.hidePanZoom === true;
	const isEmpty = properties.isEmpty === true;
	const isError = properties.isError === true;
	const isLoading = properties.isLoading === true;
	const hideNow = properties.hideNow === true;
	const enableMarkers = properties.enableMarkers === true;

	//when "isCompactView" is true, hide heading and legend sections
	if (!trigger || trigger === 'isCompactView') {
		api.updateSectionVisibility('heading', !isCompactView);
		api.updateSectionVisibility('legend', !isCompactView);
		api.updateVisibility('menuBarPosition', !isCompactView);
	}

	//when "enableMarkers" is false, hide "markersConfig"
	if (!trigger || trigger === 'enableMarkers') {
		api.updateVisibility('markersConfig', enableMarkers);
	}

	//when "displayPopover" is false, hide popoverMacroponent
	if (!trigger || trigger === 'displayPopover') {
		api.updateVisibility('popoverMacroponent', displayPopover);
	}

	//hide "hideNow", "minZoomSpread" and "nowButtonLabel" when "hidePanZoom" is true.
	if (!trigger || trigger === 'hidePanZoom') {
		api.updateVisibility('minZoomSpread', !hidePanZoom);
		api.updateVisibility('hideNow', !hidePanZoom);
		api.updateVisibility('nowButtonLabel', !hidePanZoom);
	}

	//hide "nowButtonLabel" when "hideNow" is true.
	if (!trigger || trigger === 'hideNow') {
		api.updateVisibility('nowButtonLabel', !hideNow);
	}

	//hide "emptyMessage" when show empty state is false
	if (!trigger || trigger === 'isEmpty') {
		api.updateVisibility('emptyMessage', isEmpty);
	}

	//hide "errorMessage" when show error state is false
	if (!trigger || trigger === 'isError') {
		api.updateVisibility('errorMessage', isError);
	}

	//hide "loadingMessage" when show loading state is false
	if (!trigger || trigger === 'isLoading') {
		api.updateVisibility('loadingMessage', isLoading);
	}
}
