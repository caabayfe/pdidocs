function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.makeUibTabAccessible();
                });
            }
			/* method for adding appropriate roles for uib tab set template and also handle arrow key navigation
			  for eg.
				  <ul role="tablist">
					  <li role="presentation">
						  <a role="tab"></a>
					  </li>
				  </ul>
			*/
            scope.makeUibTabAccessible = function() {
                // For easy reference
                var keys = {
                    left: 37,
                    up: 38,
                    right: 39,
                    down: 40
                };
                var tabList = element.parent()[0];
                tabList = angular.element(tabList);
                tabList.attr("role", "tablist");
                // For each individual tab DIV, set class and aria role attributes
                var tabContainer = element.parent().parent().find(".tab-content > div.tab-pane");
                tabContainer.attr({
                    "role": "tabpanel"
                });
                var tabs = tabList.find('li > a');
                angular.forEach(tabs, function(tab, index) {
                    var tabParent = angular.element(tab).parent();
                    var tabElement = angular.element(tab);
                    var tabId = tabParent.attr("heading").replace(/ /g, '_');
                    if (tabParent && tabParent.parent() && tabParent.parent()[0] && tabParent.parent()[0].className.includes("dropdown-menu"))
                        tabId = "dropdown_menu_" + tabId;
					
                    tabElement.attr({
                        "id": tabId,
                        "role": "tab",
                        "aria-selected": "false",
                        "aria-controls": tabId + "panel",
                        "tabindex": "-1"
                    }).parent().attr("role", "presentation");
                    tabContainer.eq(index).attr({
                        "aria-labelledby": tabId,
                        "id": tabId + "panel"
                    });
                    // Set key events on tabList item for navigating tabs
                    tabElement.keyup(function(event) {
                        var vertical = element.parent().parent().attr("vertical"); // check orientation
                        var proceed = false;
                        var key = event.which;
                        if (vertical === "true") {
                            if (key === keys.up || key === keys.down) {
                                event.preventDefault(); // need to prevent page scroll
                                proceed = true;
                            }
                        } else {
                            if (key === keys.left || key === keys.right) {
                                proceed = true;
                            }
                        }
                        if (proceed && !tabElement.parent().parent()[0].className.includes("dropdown-menu")) { //To avoid if its a dropdown
                            switch (key) {
                                case keys.left:
                                case keys.up:
                                if (tabElement.parent().prev().prev().length != 0 && tabElement.parent().prev()[0].tagName != "LI") {
                                	tabElement.parent().prev().prev().find("> a").click();
                                }
                                else if (tabElement.parent().prev().length != 0 ) {
                                	tabElement.parent().prev().find("> a").click();
                                	}
                                	else {
                                	 tabList.find("li:last > a").click();
                                	}
                                 break;
                                case keys.right:
                                case keys.down:
                                if (tabElement.parent().next().next().length != 0 && tabElement.parent().next()[0].tagName != "LI") {
                                	tabElement.parent().next().next().find("> a").click();
                                	}
                                	else if (tabElement.parent().next().length != 0)
                                		tabElement.parent().next().find("> a").click();
                                	else {
                                	 tabList.find("li:first > a").click();
                                	 }
                                	 break;
                                	 }
                             }
                     });
                    // Set the click event for each tab link
                    tabElement.click(function(event) {
                        tabList.find("> li.active").find("> a").attr({
                            "aria-selected": "false",
                            "tabindex": "-1"
                        });
                        tabElement.attr({
                            "aria-selected": "true"
                        }).removeAttr("tabindex").focus();
                    });
                });
                // Set initial state for the selected tab
                tabList.find("> li.active").find("> a").attr({
                    "aria-selected": "true"
                }).removeAttr("tabindex");
            }
        }
    }
}
