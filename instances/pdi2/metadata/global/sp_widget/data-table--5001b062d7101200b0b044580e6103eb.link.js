function(scope, element, attrs, ctrl){
	var $ul, $contextMenu;
	var currentRowIndex = null;

	scope.focusOnTableHeader = function() {
		element.find(".data-table-title").attr("tabindex", "-1").focus();
	}

	element.on('contextmenu', function(e){
		if (e.ctrlKey)
			return; // ctrlKey is for the debug menu, not this menu

		var rowScope = angular.element(e.target).scope();
		var field, item, fieldVal;
	    	var rowElement = angular.element(e.target).closest('tr');
        	currentRowIndex = rowElement.scope().$index;

		// Context Menu for tbody
		if (angular.isDefined(rowScope.field) && angular.isDefined(rowScope.item)){
			e.preventDefault();
			field = rowScope.field;
			item = rowScope.item;
			if(item[field].isFieldReadable === false) return;
			fieldVal = item[field].value;

			var items = [
				['${Show Matching}', function(){
					ctrl.createQueryTerm(scope.data.table, field, item.sys_id, '=').then(function(term){
						ctrl.showMatching(field, term);
					});
				}],
				['${Filter Out}', function(){
					ctrl.createQueryTerm(scope.data.table, field, item.sys_id, '!=').then(function(term){
						ctrl.filterOut(field, term);
					});
				}]
			];

			renderContextMenu(items);
			setContextMenuPosition(e);
		}
	});

	function renderContextMenu(items){
		var scrollHeight = $('body').get(0).scrollHeight;
		$contextMenu = angular.element('<div>', {'class': 'dropdown clearfix context-dropdown open'});
		
		// Store row index for focus restoration on ESC/TAB
		$contextMenu.data('rowIndex', currentRowIndex);

		$contextMenu.on('click', function (e) {
			if ($(e.target).hasClass('dropdown')) {
				_clearContextMenus(event);
			}
		});
		$contextMenu.on('contextmenu', function (event) {
			event.preventDefault();
			_clearContextMenus(event);
		});

		$contextMenu.css({
			position: 'absolute',
			top: 0,
			height: scrollHeight,
			left: 0,
			right: 0,
			zIndex: 9999
		});

		$('body').append($contextMenu);

		$ul = angular.element('<ul>', {
			'class': 'dropdown-menu',
			'role': 'menu'
		});
		renderItems();
		$contextMenu.append($ul);
		
		// Custom keyboard navigation for context menu
		$ul.on('keydown', 'a', function(e) {
			var items = $ul.find('a');
			var currentIndex = items.index(this);
			
			// Handle UP arrow key
			if (e.keyCode === 38) {
				e.preventDefault();
				e.stopPropagation();
				var targetIndex = (currentIndex === 0) ? items.length - 1 : currentIndex - 1;
				items.eq(targetIndex).focus();
			}
			// Handle DOWN arrow key
			else if (e.keyCode === 40) {
				e.preventDefault();
				e.stopPropagation();
				var targetIndex = (currentIndex === items.length - 1) ? 0 : currentIndex + 1;
				items.eq(targetIndex).focus();
			}
			// Handle ESC key
			else if (e.keyCode === 27) {
				e.preventDefault();
				_clearContextMenus(e);
				var focusableElements = $('tr[ng-repeat="item in data.list track by item.sys_id"] th[scope="row"] a');
				if (currentRowIndex !== null && focusableElements.length > currentRowIndex) {
					focusableElements.eq(currentRowIndex).focus();
				}
			}
			// Handle TAB key
			else if (e.keyCode === 9) {
				e.preventDefault();
				_clearContextMenus(e);
				var focusableElements = $('tr[ng-repeat="item in data.list track by item.sys_id"] th[scope="row"] a');
				if (e.shiftKey) {
					// Shift+Tab: focus current row
					if (currentRowIndex !== null && focusableElements.length > currentRowIndex) {
						focusableElements.eq(currentRowIndex).focus();
					}
				} else {
					// Tab: focus next row
					if (currentRowIndex !== null && focusableElements.length > 0) {
						var nextRowIndex = (currentRowIndex + 1) % focusableElements.length;
						focusableElements.eq(nextRowIndex).focus();
					}
				}
			}
		});
		
		setTimeout(function() {
			var firstMenuItem = $ul.find('a').first();
			if (firstMenuItem.length)
				firstMenuItem[0].focus();
		}, 0);
		function renderItems(){
			angular.forEach(items, function (item) {
				var $li = angular.element('<li>');

				if (item === null) {
					$li.addClass('divider');
				} else {
					var $a = angular.element('<a>');
					$a.attr({tabindex: '0', href:'#', role: 'menuItem'});
					$a.text(item[0]);
					$li.append($a);
					$li.on('click', function (e) {
						e.preventDefault();
						scope.$apply(function () {
							_clearContextMenus(e);
							item[1].call(item, item);
						});
					});
				}

				$ul.append($li);
			});
		}
	}

	function _clearContextMenus(event){
		if (!event){
			return;
		}

		angular.element(event.currentTarget).removeClass('context');

		var els = angular.element(".context-dropdown");
		angular.forEach(els, function(el){
			angular.element(el).remove();
		});
	}

	var contextMenuItemHeight = 0;
	function setContextMenuPosition(event){
		if (contextMenuItemHeight === 0)
			contextMenuItemHeight = $ul.children(0).height();

		// Why not just call .width() and .height() on the container? Because those calculations cause browsers to reflow
		// that can cause IE10 to take 200ms to render a context menu.
		var cmWidth = 150;
		var cmHeight = contextMenuItemHeight * $ul.children().length;
		var startX = event.pageX + cmWidth >= window.innerWidth ? event.pageX - cmWidth : event.pageX;
		var startY = event.pageY + cmHeight >= window.innerHeight ? event.pageY - cmHeight : event.pageY;

		$ul.css({
			display: 'block',
			position: 'absolute',
			left: startX,
			top: startY,
			'min-width': cmWidth
		});
	}
}
