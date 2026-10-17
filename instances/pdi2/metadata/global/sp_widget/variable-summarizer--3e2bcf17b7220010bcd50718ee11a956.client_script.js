function($scope, snAttachmentHandler, i18n, spModal, $timeout) {
  /* widget controller */
  var c = this;
	c.toggle = c.options.toggle || false;
	c.hide_control = c.options.hide_control || false;
	c.task = c.options ? c.options.task : "";

	/* Open mrvs data in a model for mobile screen */
	c.openMrvsModal = function(data) {
		spModal.open({
			title: data.label,
			widget: "template_renderer",
			widgetInput: {data: data, template: "sp_multirow_vs_summarizer.html"},
			buttons: [{label:c.data.labelClose, primary: true}]
		});
	}

	$scope.scanAttachment = function(variable) {
		if (variable.state == 'not_available')
			snAttachmentHandler.showMessage('error',i18n.getMessage('Upload file scan failed').withValues([variable.display_value]));
		else
			snAttachmentHandler.scanAttachment({'sys_id' : variable.value});
	}

	c.getMrvsLink = function(variable) {
		return i18n.format(c.data.clickToView,[variable.label]);
	}

	c.isPopoverOpen = [];
	c.togglePopover = function(index) {
		if(c.isPopoverOpen[index])
			c.isPopoverOpen[index] = false;
		else {
			c.isPopoverOpen.forEach((_,i) => c.isPopoverOpen[i] = false);
			c.isPopoverOpen[index] = true;
			$timeout(()=>{
				$scope.openPopover(index);
			},100);
		}
	};

	$scope.openPopover = function(index) {
		const popoverElement = document.querySelector('.popover');
		if (popoverElement) {
			popoverElement.setAttribute('tabindex', '0'); // Make popover itself focusable
			popoverElement.focus();
			document.querySelector('#popoverLink' + index).setAttribute('aria-expanded', 'true');

			// Set up focus trapping
			var closePopoverButton = document.querySelector('#closePopoverButton');
			var focusableElements = popoverElement.querySelectorAll('td[tabindex="0"], th[tabindex="0"]');
			var firstFocusableElement = focusableElements[0];
			var lastFocusableElement = focusableElements[focusableElements.length - 1];

			// Handle key events for trapping focus and closing
			popoverElement.addEventListener('keydown', function(event) {
				if (event.key === 'Tab') {
					if (event.shiftKey) { // Shift + Tab for reverse focus
						if (document.activeElement === firstFocusableElement) {
							event.preventDefault();
							closePopoverButton.focus();
						}
						else if(document.activeElement === closePopoverButton) {
							event.preventDefault();
							lastFocusableElement.focus();
						}
						else if(document.activeElement === popoverElement){
							$scope.closePopover(index);
						}
					} else { // Tab for forward focus
						if (document.activeElement === lastFocusableElement) {
							event.preventDefault();
							closePopoverButton.focus();
						} else if (document.activeElement === popoverElement) {
							event.preventDefault();
							firstFocusableElement.focus();
						}
					}
				} else if (event.key === 'Escape')
					// Close popover on Escape and return focus to the hyperlink
					$scope.closePopover(index);
			});
		}
	};

	$scope.closePopover = function(index) {
		c.isPopoverOpen[index] = false;
		$timeout(() => {
			var triggerButton = document.querySelector('#popoverLink' + index);
			if (triggerButton) {
				triggerButton.focus();
				triggerButton.setAttribute('aria-expanded', 'false');
			}
		}, 100);
	}
}
