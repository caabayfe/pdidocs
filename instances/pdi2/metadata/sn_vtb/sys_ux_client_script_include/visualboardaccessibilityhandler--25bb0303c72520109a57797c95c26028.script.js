function include({imports}) {
	const KEYS = {
		ESCAPE: 'Escape',
		F2: 'F2',
		TAB: 'Tab',
		ENTER: 'Enter'
	};

	const {focusInside, focusOutside} = imports['sn_vtb.VisualBoardAccessibilityUtils']();

	const defaultKeyPressHandlers = {
		'Tab': (activeElement, arrNavHandlerDescriptor, event, onFocusLost) => {
			if (activeElement && activeElement.matches(arrNavHandlerDescriptor.elementSelector)) {
				onFocusLost({element: activeElement, key: KEYS.TAB});
				event.preventDefault();
				activeElement.blur();
			}
		},
		'Escape': (activeElement, arrNavHandlerDescriptor, event) => {
			// Bring focus back to the elem
			if (activeElement && !activeElement.matches(arrNavHandlerDescriptor.elementSelector)) {
				let activeEle = activeElement;
				if (arrNavHandlerDescriptor.closeDeepEle) {
					activeEle = arrNavHandlerDescriptor.closeDeepEle(activeElement);
				}
				focusOutside(activeEle, arrNavHandlerDescriptor.elementSelector, event);

			}
		},
		'F2': (activeElement, arrNavHandlerDescriptor, event) => {
		    if(!arrNavHandlerDescriptor.elementFirstChildSelector) {
		    	return;
		    }
			// If element is currently focused, enter the element (i.e focus inside)
			// Else focus back on the top element
			if (activeElement && activeElement.matches(arrNavHandlerDescriptor.elementSelector)) {
				let activeEle = activeElement;
				if (arrNavHandlerDescriptor.getRootEle) {
					activeEle = arrNavHandlerDescriptor.getRootEle(activeElement);
				}
				// Focus inside the element
				focusInside(activeEle, arrNavHandlerDescriptor.elementFirstChildSelector, event);
			} else {
				let activeEle = activeElement;
				if (arrNavHandlerDescriptor.closeDeepEle) {
					activeEle = arrNavHandlerDescriptor.closeDeepEle(activeElement);
				}
				// Focus back on the element
				focusOutside(activeEle, arrNavHandlerDescriptor.elementSelector, event);
			}
		}
	}


	const boardAccessibilityHandler = (action, subComponentsArrowNavigationDescriptors, onFocusLost) => {
		const {event, name} = action.payload;
		const path = event.composedPath ? event.composedPath() : event.path;
		const activeElement = path[0];
		const arrNavHandlerDescriptor = subComponentsArrowNavigationDescriptors[name];
		if (arrNavHandlerDescriptor) {
			const keyPressHandler = arrNavHandlerDescriptor[event.key] || defaultKeyPressHandlers[event.key];
			if (keyPressHandler) {
				return keyPressHandler(activeElement, arrNavHandlerDescriptor, event, onFocusLost);
			}
		}
	}
	return {
		boardAccessibilityHandler
	}
}
