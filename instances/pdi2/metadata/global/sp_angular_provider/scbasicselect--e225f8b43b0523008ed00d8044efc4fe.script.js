function ($timeout, i18n) {
	return {
		restrict: 'C',
		scope: true,
		link: function (scope, element) {
				if (angular.isFunction(element.select2)) {
					element.css("opacity", 0);
					$timeout(function() {
						element.css("opacity", 1);
						element.select2({'formatNoMatches': i18n.getMessage('No matches found') });
						element.parent().find(".select2-focusser").attr("aria-expanded", false);
					});
				}

				element.on("select2-open", function() {
					if (element.data('select2').search.val() === " ")
					    element.select2("search", "");

					element.parent().find(".select2-focusser").attr("aria-expanded", true);

				});

				element.on("select2-close", function() {
					element.parent().find(".select2-focusser").attr("aria-expanded", false);
				});
		}
	}
}
