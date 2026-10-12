function todosTaskLineItemLink ($scope, elem, attr, c) {
	document.addEventListener('click', function (evnt) {
		evnt.stopPropagation();				
		if (!c.showAllDelegatePopover || /show-delegate-popover/.test(evnt.target.className))
			return;
		
		var delegatePopover = elem[0].querySelector('.delegate-popover');
		if (delegatePopover)
			$scope.$apply(function () {
				c.showAllDelegatePopover = delegatePopover.contains(evnt.target);
			});
	});
	
	// hide popover on esc keypress
	document.onkeyup = function (e) {
		if (c.showAllDelegatePopover && e.keyCode === 27)
			// need to force $digest to remove delay
			$scope.$apply(function () {
				c.showAllDelegatePopover = false;
			});
	};
	
	c.showTooltip = function (e) {
		var tTipElem = e.target;
		// bootstrap replaces 'title' with 'data-original-title'
		tTipElem.setAttribute('data-original-title', "");
		if (tTipElem.scrollWidth > tTipElem.offsetWidth) {
			var ellipsisTextContent = tTipElem.children[0] ? tTipElem.children[0].textContent : tTipElem.textContent;
			tTipElem.setAttribute('data-original-title', ellipsisTextContent);
		}
	};
}
