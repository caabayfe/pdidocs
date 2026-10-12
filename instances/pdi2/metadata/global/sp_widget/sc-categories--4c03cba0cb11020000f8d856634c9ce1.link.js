function link(scope, element, attrs, controller) {
    init = function() {
        var isOpen = false;
        scope.$evalAsync(function() {
            element.on("select2-open", function() {
                isOpen = true;
                element.parent().find(".select2-focusser").attr("aria-expanded", isOpen);
            });
            element.on("select2-close", function() {
                isOpen = false;
                element.parent().find(".select2-focusser").attr("aria-expanded", isOpen);
            });
        });

        setTimeout(function() {
            var select2Focusser = element.parent().find(".select2-focusser");
            var select2Results = element.parent().find("ul.select2-results");
            select2Focusser.attr("aria-expanded", isOpen);
            select2Focusser.attr("aria-owns", select2Results.attr("id"));
            var existingAriaLabelledBy = select2Focusser.attr("aria-labelledby");
			var newAriaLabelledBy = existingAriaLabelledBy ? existingAriaLabelledBy + " catalog_title" : "catalog_title";
			select2Focusser.attr('aria-labelledby', newAriaLabelledBy);
        }, 500);
    };
    init();
}
