function($scope, spKBCategoryService, $timeout, $location, $rootScope, urlTools, spAriaFocusManager, spAriaUtil, i18n) {
	var c = this;
	var categoryNotSelected = spKBCategoryService.isCategorySelected() == false;
	
	c.isSelectedCatagory = function(categoryId){
		return categoryNotSelected && (categoryId == c.data.categoryId);
	}

	$scope.hideCategoryWidgetInXS = (c.data.categoryId) ? true : false;
	spKBCategoryService.addDefaultListener(function(catId){
		$location.search({id: 'kb_category', kb_category: catId, kb_id: c.data.kb_id});
	});
	
	c.setCategory = function(evt, catId) {
		evt.preventDefault();
		var searchParms = $location.search();
		searchParms.kb_category = catId;
		searchParms.spa = 1;
		$location.search(searchParms);
		spKBCategoryService.setCategoryId(catId);
	};
	
	// Location change handler for back/forward buttons
	var removeLw = $rootScope.$on('$locationChangeSuccess', function(e, newUrl) {
		spAriaFocusManager.focusOnPageTitle();
		var urlParts = urlTools.parseQueryString(newUrl)
		if (urlParts.id === 'kb_category' && spKBCategoryService.getCategoryId() !== urlParts.kb_category)
			spKBCategoryService.setCategoryId(urlParts.kb_category);
	});
	
	$scope.$on('$destroy', function(){
		removeLw();
	});
	
	// Category is selected. Display articles in this category.
	$scope.categorySelected = function($event, category) {
		var elem = $($event.currentTarget);
		if (elem.attr('role') == 'treeitem')
			elem.attr('aria-selected' , true);
		else
			elem.parent().attr('aria-selected' , true);
			$timeout(function() {
				var searchParms = $location.search();
				searchParms.id = 'kb_category';
				searchParms.kb_category = category.value;
				$location.search(searchParms).hash('');
				spKBCategoryService.setCategoryId(category.value);
				spKBCategoryService.setCategorySelected(true);
			});
	};
	
	$scope.handleKeyPress = function($event, category) {
		
		// Keyboard Focus on a tree item creates a selection.
    // Up and Down arrow keys move focus and selection. Previous selections are cleared
    // Right arrow key to expand collapsed node.
    // Left arrow key to collapse expanded node.

		$event.stopPropagation();
		var currentKb = $($event.currentTarget);  // Get the current Kb category.
		var kbCategories = currentKb.closest('ul.category-list').find('.group-item');
		var index = -1;

		if(kbCategories.length > 0)
			index = kbCategories.index(currentKb);

		switch($event.which) {
			case 40: // Arrow down key.
				if(index+1 < kbCategories.length)
					handleArrowDown($event, index , kbCategories);
				break;
			case 38: // Arrow Up key.
				if(index > 0)
					handleArrowUp($event, index , kbCategories);
				break;
			case 37: // Left key.
	      handleArrowLeft($event, category, currentKb);
				break;
				
			case 39: // Right key.
				handleArrowRight($event, category, currentKb);
				break;
	 }
	};
	
    function handleArrowDown($event, index, kbCategories) {
	    $event.preventDefault();
	    kbCategories.get(index).setAttribute('tabindex', '-1');
	    kbCategories.get(index+1).setAttribute('tabindex', '0');
	    kbCategories.get(index+1).focus();
    }
	
    function handleArrowUp($event, index, kbCategories) {
	    $event.preventDefault();
	    kbCategories.get(index).setAttribute('tabindex', '-1');
	    kbCategories.get(index-1).setAttribute('tabindex', '0');
	    kbCategories.get(index-1).focus();
    }
	
	function handleArrowLeft($event, category, currentKb) {
		if(category.showChildren) {
			$scope.displayChildren($event, category);
		} else {
			var parentSubcategory = currentKb.closest('ul.sub-category-list');
			if (parentSubcategory) {
				var closestParent = parentSubcategory.parent('li').find('.group-item');
				if(closestParent && closestParent.length > 0)
					setFocus(closestParent, currentKb);
			}
		}
	}
	
	function handleArrowRight($event, category, currentKb) {
		if(category.subcategories.length === 0){
			return;
		}
		if(currentKb && !category.showChildren) {
			$scope.displayChildren($event, category);
		} else if(category.subcategories && category.subcategories.length > 0) {
		    var closestChild = currentKb.next().find('.group-item');
			  if(closestChild && closestChild.length > 0)
					setFocus(closestChild, currentKb);
		}
	}

	function setFocus(node, currentElem){
		if (node) {
			currentElem.attr('tabindex', -1);
			node.get(0).setAttribute('tabindex', 0);
			node.get(0).focus();
		}
	}
	
	//To support Show more functionality
	$scope.loadMore = function() {
		c.data.getMore = true;
		c.data.loadAllMsg = c.data.pleaseWait;
		c.data.categoriesCount = c.data.categoriesCount;   
		c.server.update().then(function() {
			if(!c.data.showMore) {
				var selectedCategory = $('.category-list .group-item[tabindex="0"]'); 
				selectedCategory.focus();
			}
		});
	}; 
	
	//On expanding the node, reset + to - 
	$scope.displayChildren = function($event, category) {
		$event.stopPropagation();
		category.showChildren = !category.showChildren;
		var message = '';
		if (category.count > 1)
			message = i18n.getMessage("{0} {1} {2} Articles").withValues([category.label,c.data.messages[category.showChildren ? 'expanded' : 'collapsed'], category.count]);
		else
			message = i18n.getMessage("{0} {1} {2} Article").withValues([category.label,c.data.messages[category.showChildren ? 'expanded' : 'collapsed'], category.count]);
		spAriaUtil.sendLiveMessage(message);
	};
	var listenerForBrowseCategories = $scope.$on("$sp.kb.show.categories_widget", function() {
		$scope.hideCategoryWidgetInXS = false;
	});
	$scope.$on("$destroy", function() {
		listenerForBrowseCategories();
	});
}
