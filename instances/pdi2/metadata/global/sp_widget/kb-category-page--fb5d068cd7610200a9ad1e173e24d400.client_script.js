function ($scope, $element, $rootScope, $timeout, spKBCategoryService) {
	var accessWordCountMax = 15;
	var c = this;
	init();
	
	if (spKBCategoryService.isCategorySelected())
		focusTitle();
	
	c.getShortenText = function getShortenText(text) {
		var wordsArray = text.split(" ");
		if (wordsArray.length > accessWordCountMax)
			wordsArray = wordsArray.slice(0, accessWordCountMax);
		return wordsArray.join(" ");
	}

	var removeListener = spKBCategoryService.addListener(function(catId) {
		c.data.category = catId;
		c.data.items = null;
		c.server.update().then(function(){
			init();
		});
	});
	
	function focusTitle(){
		$timeout(function() {
			var kbCategoryTitle = $element.find('.panel-title');
			if (kbCategoryTitle[0])  
				kbCategoryTitle[0].focus();
			spKBCategoryService.setCategorySelected(false);
		}, 500);
	}
	
	function init() {
		$timeout(function() {
			$rootScope.$broadcast('sp.update.breadcrumbs', c.data.breadcrumbs);
		});
	}		
	$scope.hideItemWidget = !$scope.data.category;
	$scope.showCategories =  function() {
		$scope.hideItemWidget = true;
		$rootScope.$broadcast("$sp.kb.show.categories_widget");
	}
	$scope.$on('$destroy', function(){
		removeListener();
	});

	$scope.loadMore = function () {
		var focusableIndex = c.data.limit;
		c.data.new_limit = c.data.limit + (parseInt(c.options.limit_article) || 10);
		c.server.update().then(function(){
			$scope.focusOnKbArticle(focusableIndex);
		});
	}

	$scope.focusOnKbArticle = function(index) {
		$timeout(function(){
			var kbArticles = $element.find(".sp-kb-topic-article a");
			if (kbArticles[index]) kbArticles[index].focus();
		});
	};
}
