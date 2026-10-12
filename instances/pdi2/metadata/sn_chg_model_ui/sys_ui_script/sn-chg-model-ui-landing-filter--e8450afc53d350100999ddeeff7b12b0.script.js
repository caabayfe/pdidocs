angular.module("sn.app_itsm.now.filter", ["sn.common"])
.directive("landingFilter", function(getTemplateUrl, i18n, TextSearchService) {
	"use strict";
	return {
		restrict: "E",
		templateUrl: function(tElement, tAttrs) {
			return getTemplateUrl(tAttrs.template);
		},
		scope: {
			configuration: "=",
			isDisabledFn: "&"
		},
		link: function($scope) {
			$scope.searchText = { value: "" };
			TextSearchService.searchText = $scope.searchText;
			TextSearchService.filterByArray = $scope.configuration.filterConditions;

			$scope.isLoading = function() {
				return $scope.$parent.loading;
			};

			$scope.isDisabled = function() {
				if ($scope.isDisabledFn !== undefined)
					return $scope.isLoading() || $scope.isDisabledFn();

				return $scope.isLoading();
			};

			$scope.$watch("searchText.value", function(newValue, oldValue) {
				if (newValue === undefined || newValue === oldValue)
					return;

				$scope.$emit("textSearch", newValue);
			});
		},
		controller: function($scope) {
			$scope.placeholder = ($scope.configuration.placeholderText) ? $scope.configuration.placeholderText : i18n.getMessage("Filter");
			$scope.ariaLabel = $scope.placeholder;
		}
	};
})
.filter("chgModelFilter", ["TextSearchService", function(TextSearchService) {
	return function(arrayToFilter, textSearch) {
		return TextSearchService.getFilteredArray(arrayToFilter, textSearch);
	};
}])
.service("TextSearchService", ["$filter", function($filter) {
	var textSearchService = this;

	textSearchService.searchText = {};
	textSearchService.filterByArray = [];

	function convertToArray(object) {
		var arr = [];
		if (!object)
			return arr;

		Object.keys(object).forEach(function(key) {
			arr.push(object[key]);
		});

		return arr;
	}

	var searchObject = function(object, searchPathArray, searchText) {
		for (var i = 0; i < searchPathArray.length; i++) {
			var path = searchPathArray[i].split(".");
			var property = path[path.length - 1];
			var obj = object;
			for (var j = 0; j < path.length - 1; j++) {
				if (Array.isArray(obj[path[j]])) {
					var res = false;
					var subPath = searchPathArray.slice(i, i + 1);
					subPath[0] = subPath[0].replace(path[j] + ".", "");
					for (var k = 0; k < obj[path[j]].length; k++)
						if (searchObject(obj[path[j]][k], subPath, searchText))
							return true;
				}
				else
					obj = obj[path[j]];
			}
			if (obj && obj[property])
				if (obj[property].toLowerCase().indexOf(searchText.toLowerCase()) > -1)
					return true;
		}
		return false;
	};

	textSearchService.clearFilters = function() {
		if (textSearchService.searchText)
			textSearchService.searchText.value = "";
		
		angular.element('.change-model-board-filter-search #search2').focus();
	};

	textSearchService.getFilteredArray = function(arrayToFilter, textSearch) {
		if (!Array.isArray(arrayToFilter))
			arrayToFilter = convertToArray(arrayToFilter);

		if (!textSearch || textSearch === "")
			return arrayToFilter;

		var textFilteredChgModels = $filter("filter")(arrayToFilter, function(obj) {
			return searchObject(obj, textSearchService.filterByArray, textSearch);
		});

		return textFilteredChgModels;
	};
}])
.service("HighlightService", ["$sanitize", "$sce", function($sanitize, $sce) {
	var highlightService = this;

	function escapeRegExp(str) {
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	function getHTMLEntity(str) {
		return angular.element('<div />').text(str).html();
	}

	highlightService.highlight = function(text, highlightText, highlightClass) {
		if (!highlightText || !highlightClass || !text)
			return getHTMLEntity(text);

		cleanHighlightText = getHTMLEntity(highlightText);
		cleanHighlightClass = getHTMLEntity(highlightClass);
		var pattern = new RegExp(escapeRegExp(cleanHighlightText), "gi");
		var replacedText = getHTMLEntity(text).replace(pattern, '<span class="' + cleanHighlightClass + '">$&</span>');
		return $sce.trustAsHtml(replacedText);
	};
}]);
