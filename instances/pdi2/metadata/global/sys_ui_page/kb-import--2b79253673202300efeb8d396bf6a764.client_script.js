jQuery(document).ready(function() {
	var dropdownTooltips = {
		'#knowledgebase': '${CLOSE_KNOWLEDGE_ARIA_LABEL}',
		'#category': '${CLOSE_CATEGORY_ARIA_LABEL}'
	};
	var CLOSE_BUTTON_SELECTOR = '.select2-search-choice-close, .select2-selection__clear';

	function applyTooltip(closeButton, tooltipText) {
		if (closeButton.length && !closeButton.attr('title')) {
			closeButton.attr({
				'title': tooltipText,
				'data-toggle': 'tooltip',
				'data-placement': 'top',
				'tabindex': '0'
			});
			if (typeof closeButton.tooltip === "function") {
				closeButton.tooltip({
					trigger: 'hover focus',
					placement: 'top'
				});
			}
		}
	}

	var mainContainer = jQuery('.container-fluid.main-container')[0];
	if (mainContainer) {
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(node) {
					if (node.nodeType === 1) {
						var addedButtons = jQuery(node).find(CLOSE_BUTTON_SELECTOR).addBack(CLOSE_BUTTON_SELECTOR);
						if (addedButtons.length) {
							jQuery.each(dropdownTooltips, function(selector, text) {
								var dropdownContainer = jQuery(selector).parent()[0];
								if (dropdownContainer && jQuery.contains(dropdownContainer, addedButtons[0])) {
									applyTooltip(addedButtons, text);
								}
							});
						}
					}
				});
			});
		});

		observer.observe(mainContainer, {
			childList: true,
			subtree: true
		});
	}
});
