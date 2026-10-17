function link(scope, element, attrs, controller) {

    var $timeout = $injector.get('$timeout');
    if (window.ResizeObserver) {
        var spPageroot = document.querySelector(".sp-page-root");
        var resizeObserver = new ResizeObserver(function() {
            if ($('.sp-page-root').width() < 768)
                controller.view = 'mobile';
            else {
                $(".modal-backdrop").hide();
                controller.view = 'desktop';
            }
            $timeout(controller.adaptFilters);
        });
        if (spPageroot)
            resizeObserver.observe(spPageroot);
    }

    // on esc close the dropdown
    $(element).on('keydown', '.dropdown-menu', function(e) {
        if (e.keyCode === 27 /*ESCAPE*/ ) {
            var dropdownToggle = ($(e.target).parents('.dropdown')) ? $(e.target).parents('.dropdown').children('.dropdown-toggle') : undefined;
            if (dropdownToggle) {
                dropdownToggle.dropdown('toggle');
                dropdownToggle.focus();
            }
        }
    });

    // filter group events
    $(element).on('keydown', '.filter-style', function(e) {
        // below conditions check if filter-group is ticked on enter, and filter-group toggle is working on space
        if ((e.keyCode === 13 /*ENTER*/ && !$(e.target).is('span')) || (e.keyCode === 32 /*SPACE*/ && ($(e.target).is('span') || $(e.target).is('button')))) {
            var filterElement = ($(e.target).parent('.filter-style') && $(e.target).parent('.filter-style').length > 0) ? $(e.target) : undefined;
            if (filterElement) {
                filterElement.click();
            }
            // filter-group intermediate icon is pressed
            if ($(e.target).is('button')) {
                $(e.target).next().focus();
            }
        }
    });

    // subfilter events, click checkbox on enter
    $(element).on('keydown', '.subfilter-style', function(e) {
        if (e.keyCode === 13 /*ENTER*/ ) {
            var subFilterElement = ($(e.target).parent('.subfilter-style') && $(e.target).parent('.subfilter-style').length > 0) ? $(e.target) : undefined;
            if (subFilterElement) {
                subFilterElement.click();
            }
        }
    });

    // toggle mobile modal's filter group accordian
    $(element).on('keydown', '.accordion-toggle', function(e) {
        if ($(e.target) && (e.keyCode === 13 /*ENTER*/ || e.keyCode === 32 /*SPACE*/ )) {
            $(e.target).click();
        }
    });

    // close flyout modal when clicked outside modal
    $(element).on('click', '.modal.fade.modal-flyout.in', function(e) {
        var closeButton = angular.element(document.getElementById('ec-flyout-close-btn'));
        if ($(e.target).is('.modal.fade.modal-flyout.in')) {
            closeButton.click();
        }
    });

    controller.handleAccessibilityInDropdown = function(e) {
        var target = e.target;
        var shiftPressed = e.shiftKey;
        var tabPressed = e.tabKey;
        var dropdownMenu = $(target).parents('.dropdown-menu');
        var firstListItemRow = dropdownMenu.children('.list-group').children('.list-group-item').first();

        if (dropdownMenu) {
            var clearButton = dropdownMenu.find('.clearBtn')[0];
            var applyButton = dropdownMenu.find('.applyBtn')[0];
            var inputButtons = dropdownMenu.find('input');
            var lastInputButton = inputButtons[inputButtons.length - 1];
            var firstAccordianButton = $(firstListItemRow).find('span.fa-collapse-style').length > 0 ? $(firstListItemRow).find('span.fa-collapse-style') : undefined;
            var firstInputButton = $(firstListItemRow).find('span.filter-style input').length > 0 ? $(firstListItemRow).find('span.filter-style input') : undefined;

            // Circular tabbing in dropdown
            if (e.keyCode == 9) {

                if (!firstAccordianButton && inputButtons.length == 1 && clearButton.disabled && applyButton.disabled) {
                    //only one checkbox is selectable
                    e.preventDefault();
                } else if ($(target).is(firstAccordianButton) || (!firstAccordianButton && $(target).is(firstInputButton))) {
                    if (shiftPressed) {
                        if (!applyButton.disabled) {
                            applyButton.focus();
                        } else if (!clearButton.disabled) {
                            clearButton.focus();
                        } else {
                            lastInputButton.focus();
                        }
                        e.preventDefault();
                    }
                } else if ($(target).is(lastInputButton) && clearButton.disabled && !shiftPressed) {
                    if (!applyButton.disabled) {
                        applyButton.focus();
                    } else if (applyButton.disabled && firstAccordianButton) {
                        firstAccordianButton.focus();
                    } else {
                        firstInputButton.focus();
                    }
                    e.preventDefault();
                } else if ($(target).is(clearButton) && !shiftPressed && applyButton.disabled) {
                    if (firstAccordianButton) {
                        firstAccordianButton.focus();
                    } else {
                        firstInputButton.focus();
                    }
                    e.preventDefault();
                } else if ($(target).is(applyButton) && !shiftPressed) {
                    if (firstAccordianButton) {
                        firstAccordianButton.focus();
                    } else {
                        firstInputButton.focus();
                    }
                    e.preventDefault();
                }
            }
        }
    };

    controller.handleAccessibilityInFlyout = function(e) {
        var target = e.target;
        var shiftPressed = e.shiftKey;
        var closeButton = angular.element(document.getElementById('ec-flyout-close-btn'));
        var cancelButton = angular.element(document.getElementById('ec-flyout-cancel-btn'));
        var applyButton = angular.element(document.getElementById('ec-flyout-apply-btn'));

        // close modal on ESCAPE key press
        if (e.keyCode === 27) {
            closeButton.click();
        }

        // Circular tabbing on the popup
        if (e.keyCode === 9) {
            if ($(target).is(closeButton)) {
                if (shiftPressed) {
                    if (!applyButton[0].disabled)
                        applyButton.focus();
                    else
                        cancelButton.focus();
                    e.preventDefault();
                }
                return true;
            } else if ($(target).is(cancelButton) && applyButton[0].disabled) {
                if (!shiftPressed) {
                    closeButton.focus();
                    e.preventDefault();
                }
            } else if ($(target).is(applyButton)) {
                if (!shiftPressed) {
                    closeButton.focus();
                    e.preventDefault();
                }
            }
            return false;
        }
        return true;
    };

    setTimeout(function() {

        // make dropdowns stay when clicking on anything else apply button
        $(document).on('click', '.dropdown-menu', function(e) {
            var attrValue = e.target.getAttribute("data-filter-grp-apply");
            if (attrValue === 'filter-desktop-apply') {
                var focusElementId = e.target.getAttribute("data-filter-grp-apply-id");
                angular.element(document.getElementById("filter-" + focusElementId)).focus();
            } else {
                e.stopPropagation();
            }
        });

        // to manually trigger resize event for tooltip calculations
        $(document).on('click', '.dropdown-toggle', function(e) {
            if (!$(e.target).is('#all-filters')) {
                $('.sp-page-root').trigger('resize');
                updataActiveDropdownScrollHeight();
            }
        });

        $(document).on('click', 'span.fa-collapse-style', function(e) {
            updataActiveDropdownScrollHeight();
        });

        // function to know if drodown menu is overflown
        function updataActiveDropdownScrollHeight() {
            var dropdownModal = $('body').find('.dropdown.open .filter-container-style')[0];
            var isScrollable = false;
            if (dropdownModal && dropdownModal.clientHeight < dropdownModal.scrollHeight) {
                isScrollable = true;
            }
            scope.$apply(function() {
                controller.isScrollable = isScrollable;
            });
        }

        // on close of dropdown
        $(document).on('hide.bs.dropdown', '.filter-group', function(event) {
            var categoryId = event.relatedTarget.getAttribute('data-filter-grp-id');
            var category = controller.getCategory(categoryId);
            if (category) {
                if (category.selectedFilters.length == 0) {
                    category.enableClearBtn = false;
                } else {
                    category.enableClearBtn = true;
                }
                category.enableApplyBtn = false;
                controller.updateDraftFilters(category);
            }
        });

        // on close/cancel of flyout modal
        $(document).on('hidden.bs.modal', '#ec-flyout-filter-modal', function() {
            handleDraftFilters();
        });

        // on close/cancel of mobile modal
        $(document).on('hide.bs.modal', '#ec-mobile-filter-modal', function() {
            handleDraftFilters();
        });
    }, 0);

    // handles draft filters for all categories
    function handleDraftFilters() {
        controller.enableApplyBtn = false;
        var selectedFilterCount = 0;
        controller.filtersData.forEach(function(category) {
            controller.updateDraftFilters(category);
            selectedFilterCount += category.selectedFilters.length;
        });
        if (selectedFilterCount === 0) {
            controller.enableClearBtn = false;
        } else {
            controller.enableClearBtn = true;
        }
    }

}
