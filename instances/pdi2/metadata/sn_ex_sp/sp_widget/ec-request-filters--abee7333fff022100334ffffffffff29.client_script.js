api.controller = function($scope, $timeout, i18n, $location, $document) {
    var c = this;
    c.filtersData = c.data.filterData;
    c.limitFilters = c.data.filterData.length;
    c.toggleFlyout = false;
    c.filterPills = [];
    c.filterPillsHeight = 0;
    c.enableApplyBtn = false;
    c.enableClearBtn = false;
    c.isScrollable = false;
    var filtersWidth = [];
    var TOKENIZER = "####";
    $scope.isSearched = c.data.initialSearchText.length > 0;
    $scope.isSearchIconVisible = true;
    c.$document = $document;
    if (c.data.initialSearchText) {
        $scope.searchText = c.data.initialSearchText;
        $scope.isSearchIconVisible = false;
    }

    c.showMoreLessButtons = false;

    function parseList(str, sep) {
        if (!str) return [];
        return String(str).split(sep).filter(function(s) {
            return s !== undefined && s !== null && s !== '';
        });
    }

    function joinList(list, sep) {
        var processedList = (list || []).map(function(item) {
            if (item != null && typeof item === 'object' && Object.keys(item).length > 0) {
                return item.displayValue || item.display_value || item.name || item.title || item.text || item;
            }
            return item || [];
        });
        return processedList.join(sep);
    }

    function setCategoryButtonsDraft(category, hasDraft) {
        category.enableClearBtn = !!hasDraft;
        category.enableApplyBtn = true;
        c.enableApplyBtn = true; // desktop global state safeguard
    }

    function updateReferenceSelectionFromFilters(category) {
        // Builds selection.value/displayValue from category.filters
        var selected = (category.filters || []).filter(function(f) {
            return !!f.selected;
        });
        var labels = selected.map(function(f) {
            return f.label;
        });
        var ids = selected.map(function(f) {
            return f.value;
        });
        category.selection = category.selection || {};
        category.selection.displayValue = joinList(labels, TOKENIZER);
        category.selection.value = joinList(ids, ',');
        return selected.length > 0;
    }

    function updateFiltersFromSelection(category) {
        // Rebuilds category.filters entirely from selection
        var names = parseList(category.selection && category.selection.displayValue, TOKENIZER);
        var ids = parseList(category.selection && category.selection.value, ',');
        category.filters = [];
        for (var i = 0; i < ids.length; i++) {
            category.filters.push({
                label: names[i],
                value: ids[i],
                selected: true
            });
        }
        return ids.length > 0;
    }

    function parseSelection(category) {
        return {
            names: parseList(category && category.selection && category.selection.displayValue, TOKENIZER),
            ids: parseList(category && category.selection && category.selection.value, ',')
        };
    }

    function setReferenceSelection(category, names, ids) {
        category.selection = category.selection || {};
        category.selection.displayValue = joinList(names, TOKENIZER);
        category.selection.value = joinList(ids, ',');
    }

    function removeIdFromSelection(category, id) {
        var s = parseSelection(category);
        var nextNames = [],
            nextIds = [];
        for (var i = 0; i < s.ids.length; i++) {
            if (s.ids[i] !== id) {
                nextIds.push(s.ids[i]);
                nextNames.push(s.names[i]);
            }
        }
        setReferenceSelection(category, nextNames, nextIds);
        return nextIds;
    }

    function markFilterSelected(category, id, selected) {
        (category.filters || []).forEach(function(f) {
            if (f.value === id) f.selected = !!selected;
        });
    }

    c.init = function() {
        c.view = 'desktop';
        if (c.data.isMobile || $('.sp-page-root').width() < 768) {
            c.view = 'mobile';
        }

        if (c.filtersData && c.filtersData.length > 0) {
            c.applyOnLoadFilters(c.filtersData);
        }
    };

    c.getDropdownStyle = function() {
        if ($('fieldset.dropdown') && $('fieldset.dropdown')[0]) {
            var dropdownElem = $('fieldset.dropdown')[0].getBoundingClientRect();
            var cal = dropdownElem.top + dropdownElem.height + 40;
            cal = cal + 'px';
            return {
                'max-height': 'calc(100vh - ' + cal + ')'
            };
        }
    };

    $scope.$on('field.change', function(event, eventData) {
        if (!(eventData && (eventData.categoryId || (eventData.field && eventData.field.name)))) return;

        var fieldName = eventData.categoryId || eventData.field.name;
        // Find the matching category by categoryId (reference type)
        var category = c.filtersData && c.filtersData.find(function(cat) {
            return cat && cat.categoryId === fieldName && cat.filterType === 'reference';
        });
        if (!category) return;

        category.filters = category.filters || [];

        // Handle selection add
        if (eventData.added && eventData.added.sys_id) {
            var added = eventData.added;
            var displayName = added.name || added.title || added.displayValue || added.text || '';
            var existing = category.filters.find(function(f) {
                return f.value === added.sys_id;
            });
            if (existing) {
                existing.selected = true;
                existing.label = existing.label || displayName;
            } else {
                category.filters.push({
                    label: displayName,
                    value: added.sys_id,
                    selected: true
                });
            }
        }

        // Handle selection remove (if provided)
        if (eventData.removed && eventData.removed.sys_id) {
            var removed = eventData.removed;
            category.filters.forEach(function(f) {
                if (f.value === removed.sys_id) f.selected = false;
            });
        }

        // Update draft selection state (do not emit apply yet)
        var hasDraft = updateReferenceSelectionFromFilters(category);
        setCategoryButtonsDraft(category, hasDraft);
    });

    c.applyOnLoadFilters = function(filterData) {
        var applyLoadFiltersCategory = [];
        filterData.forEach(function(item) {
            var onLoadFilterPresent = false;
            var myFilters = item.filters;
            myFilters.forEach(function(filter) {
                if (filter.selected) {
                    onLoadFilterPresent = true;
                    if (!item.isMultiple) {
                        item.selected = filter.value;
                    }
                }
            });
            if (onLoadFilterPresent) {
                applyLoadFiltersCategory.push(item);
            }

        });
        applyLoadFiltersCategory.forEach(function(item) {
            updateFilterPills(item);
            item.enableClearBtn = true;
        });
        //if (applyLoadFiltersCategory.length > 0)
        $scope.$emit('sn_ex_sp.applyRequestFilters', c.filtersData);
    };

    c.onFilterValueChangeReference = function(category, filter, isMobile, action, event) {

        // reference draft updates for checkbox list

        if (isMobile) {
            c.enableApplyBtn = true;
            c.enableClearBtn = true;
        } else {
            category.enableClearBtn = true;
            category.enableApplyBtn = true;
            c.enableApplyBtn = true;
        }

        var sel = parseSelection(category);

        if (action == "remove") {
            filter.selected = false;
            // Deselect in filters and remove from selection
            markFilterSelected(category, filter.value, false);
            var nextIds = removeIdFromSelection(category, filter.value);
            setCategoryButtonsDraft(category, nextIds.length > 0);
            event.stopPropagation();
        } else {
            var hasDraftAdd = updateFiltersFromSelection(category);
            setCategoryButtonsDraft(category, hasDraftAdd);
        }
    };

    c.onFilterValueChange = function(category, filter, isMobile, action, event) {
        if (isMobile) {
            c.enableApplyBtn = true;
            c.enableClearBtn = true;
        } else {
            category.enableClearBtn = true;
            category.enableApplyBtn = true;
        }

        if (!category.multiSelect) {
            var filters = category.filters;
            category.selected = filter.value;
            for (var j = 0; j < filters.length; j++) {
                if (filters[j].value == filter.value) {
                    filters[j].selected = true;
                } else {
                    filters[j].selected = false;
                }
            }
        }
    };

    c.clearFilters = function(category, event) {
        category.enableClearBtn = false;
        category.enableApplyBtn = true;
        category.filters.forEach(function(filter) {
            filter.selected = false;
        });
        if (category.filterType == 'reference') {
            category.selection = {};
        } else if (!category.multiSelect) {
            category.selected = "";
        }
    };

    c.applyFilter = function(category) {
        category.enableApplyBtn = false;
        if (updateFilterPills(category)) {
            $scope.$emit('sn_ex_sp.applyRequestFilters', c.filtersData);
        }
    };

    c.clearPill = function(pill) {
        var category = removeFilterPill(pill.categoryId, pill.value);
        // Deselect the corresponding filter and update selection for reference
        markFilterSelected(category, pill.value, false);
        if (category.filterType === 'reference') {
            removeIdFromSelection(category, pill.value);
        }
        updateCategorySelectedFilters(category);
        updateAppliedFilterPillsHeight(true);
        if (category.selectedFilters.length == 0) {
            category.enableClearBtn = false;
            category.enableApplyBtn = false;
            if (!category.isMultiple) {
                category.selected = "";
            }
        }
        $scope.$emit('sn_ex_sp.applyRequestFilters', c.filtersData);
    };

    function updateCategorySelectedFilters(category) {
        var selectedFiltersList = [];

        if (category.filterType == 'reference') {
            var referenceDisplayValues = [];
            var referenceValues = [];
        }

        category.filters.forEach(function(filter) {
            if (filter.selected) {
                selectedFiltersList.push({
                    value: filter.value,
                    label: filter.label
                });
                if (category.filterType == 'reference') {
                    referenceDisplayValues.push(filter.label);
                    referenceValues.push(filter.value);
                }
            }
        });

        if (category.filterType == 'reference') {
            category.selection['displayValue'] = referenceDisplayValues.join("####");
            category.selection['value'] = referenceValues.join(",");
        }

        category.selectedFilters = selectedFiltersList;
    }

    c.clearAllPills = function() {
        c.resetFilters();
        $scope.$emit("sn_ex_sp.RequestFiltersCleared", {
            allCleared: true
        });
    };

    c.resetFilters = function() {
        c.filtersData.forEach(function(category) {
            category.enableClearBtn = false;
            category.filters.forEach(function(filter) {
                filter.selected = false;
            });
            if (category.filterType == 'reference') {
                category.selection = {};
            } else if (!category.multiSelect) {
                category.selected = "";
            }
            category.filterCount = 0;
            category.selectedFilters = [];
        });
        $scope.$emit('sn_ex_sp.applyRequestFilters', c.filtersData);
        c.filterPills = [];
        c.enableClearBtn = false;
    };


    function updateFilterPills(category) {
        var categoryId = category.categoryId;
        var selectedFiltersList = [];
        var prevSelectedFilters = category.selectedFilters;

        category.filters.forEach(function(filter) {
            if (filter.selected) {
                addFilterPill(filter.label, categoryId, filter.value);
                selectedFiltersList.push({
                    value: filter.value,
                    label: filter.label
                });
            } else {
                removeFilterPill(categoryId, filter.value);
            }
        });

        if (comparePrevSelectedFilters(prevSelectedFilters, selectedFiltersList)) {
            return false;
        }

        category.selectedFilters = selectedFiltersList;
        return true;
    }

    function comparePrevSelectedFilters(prevSelectedFilters, currSelectedFiltersList) {
        if (prevSelectedFilters.length === currSelectedFiltersList.length) {
            for (var i = 0; i < prevSelectedFilters.length; i++) {
                if (prevSelectedFilters[i].value !== currSelectedFiltersList[i].value) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function addFilterPill(name, categoryId, value) {
        if (!c.checkIfFilterAlreadyAdded(categoryId, value)) {
            var pillId = (categoryId + '-' + value);
            c.filterPills.push({
                id: pillId,
                label: name,
                categoryId: categoryId,
                value: value,
                clearLabel: i18n.format(c.data.clearLabel, name)
            });
            c.enableClearBtn = true;
            return true;
        }
        return false;
    }

    function removeFilterPill(categoryId, value) {
        var category = c.getCategory(categoryId);
        var filter = category.filters.find(function(f) {
            return (f.value == value);
        });
        var pillId = (categoryId + '-' + value);
        c.filterPills = c.filterPills.filter(function(pill) {
            return !(pill.id === pillId && pill.categoryId === categoryId);
        });
        if (c.filterPills.length == 0) {
            c.enableClearBtn = false;
        }
        return category;
    }

    c.getCategory = function(categoryId) {
        return c.filtersData.find(function(category) {
            return (category.categoryId == categoryId);
        });
    };

    c.checkIfFilterAlreadyAdded = function(categoryId, value) {
        var filterPills = c.filterPills;
        var filterPillsLen = filterPills.length;

        if (filterPillsLen === 0) {
            return false;
        }
        for (var pIdx = 0; pIdx < filterPillsLen; pIdx++) {
            var pillId = (categoryId + '-' + value);
            if (filterPills[pIdx].id === pillId && filterPills[pIdx].categoryId === categoryId) {
                return true;
            }
        }
        return false;
    };

    applyFilterMobile = function() {
        c.enableApplyBtn = false;
        var emitApplyFilterEvent = false;
        c.filtersData.forEach(function(category) {
            category.enableApplyBtn = false;
            if (updateFilterPills(category)) {
                emitApplyFilterEvent = true;
            }
        });
        if (emitApplyFilterEvent) {
            $scope.$emit('sn_ex_sp.applyRequestFilters', c.filtersData);
        }
        $timeout(updateAppliedFilterPillsHeight, 0);
    };

    clearAllFiltersMobile = function() {
        $scope.$apply(function() {
            c.enableClearBtn = false;
            c.enableApplyBtn = true;
            c.filtersData.forEach(function(category) {
                category.filters.forEach(function(filter) {
                    category.selected = "";
                    filter.selected = false;
                });
                if (category.filterType == 'reference') {
                    category.selection = {};
                } else if (!category.multiSelect) {
                    category.selected = "";
                }
            });
        });
    };

    // show 'Show more' button in mobile view if filters are taking more rows
    function updateAppliedFilterPillsHeight(calledFromClearPill) {
        $timeout(function() {
            var filterPillsGroup = document.getElementById("filter-pills-group");
            var offsetHeight = filterPillsGroup.offsetHeight;
            var scrollHeight = filterPillsGroup.scrollHeight;
            c.filterPillsHeight = scrollHeight > 80 ? scrollHeight : offsetHeight;
            if (c.filterPillsHeight > 80) {
                if (calledFromClearPill) {
                    return;
                }
                c.showMoreLessButtons = true;
            }
        }, 0);
    }

    // function is called at initialization from c.adjustFilters() and filtersWidth[] is filled with category widths
    c.calculateFiltersWidth = function() {
        if (filtersWidth.length) return;
        filtersWidth = [];
        var categories = angular.element(document.getElementsByClassName('filter-group-button'));
        var filterLabel = angular.element(document.getElementsByClassName('filter-label'))[0];
        var filterLabelWidth = filterLabel && filterLabel.offsetWidth;
        filtersWidth.push(filterLabelWidth);
        for (var i = 0; i < categories.length; i++) {
            filtersWidth.push(categories[i].offsetWidth);
        }
    };

    // function is called on resize and categories are hidden/shown on UI based on available space
    c.adaptFilters = function() {
        c.FilterArray = [];
        var filterContainer = angular.element(document.getElementsByClassName('filter-bar'))[0];
        var allFilterButton = angular.element(document.getElementsByClassName('all-filters'))[0];
        var filterContainerWidth = filterContainer && filterContainer.offsetWidth;
        var allFilterButtonWidth = allFilterButton && allFilterButton.offsetWidth;
        filterContainerWidth -= allFilterButtonWidth;
        var totalFiltersWidth = 0;
        for (var item = 0; item < filtersWidth.length; item++) {
            if (filterContainerWidth >= totalFiltersWidth + filtersWidth[item] + 22) {
                totalFiltersWidth += filtersWidth[item] + 22;
                c.FilterArray.push(filtersWidth[item]);
            } else {
                break;
            }
        }
        c.limitFilters = c.FilterArray.length - 1 || c.filtersData.length;

        if (c.view == 'mobile') {
            updateAppliedFilterPillsHeight();
        }
    };

    c.adjustFilters = function() {
        $timeout(function() {
            c.calculateFiltersWidth();
            c.adaptFilters();
        }, 0);
    };

    c.getFilterAriaLabel = function(filter) {
        var label = '${Filter} ';
        return label + filter.label;
    };

    c.search = function(searchQuery, event) {
        if (!event || event.type === 'click' || (event.type == 'keydown' && (event.key === 'Enter' || event.which === 13))) {
            if (searchQuery && searchQuery.length > 0) {
                $scope.isSearched = true;
                $scope.isSearchIconVisible = false;
                $scope.$emit('sn_ex_sp.applyRequestSearch', c.filtersData, searchQuery);
            } else {
                c.resetSearch();
            }
        }
    };


    c.resetSearch = function(event) {
        if (!event || (event.type == 'keydown' && event.key === 'Enter')) {
            $scope.isSearched = false;
            $scope.isSearchIconVisible = true;
            $scope.searchText = "";
            $location.search('draftSearchText', null);
            $scope.$emit('sn_ex_sp.applyRequestSearch', c.filtersData, "");
        }
    };

    c.toggleSearchIconVisibility = function() {
        $scope.isSearchIconVisible = true;
    };


    // resets filter based on pills when clicked closed modal/dropdowns without save
    c.updateDraftFilters = function(category) {
        category.filters.forEach(function(filter) {
            if (category.selectedFilters.length > 0) {
                category.enableClearBtn = true;
            }
            var filterAdded = c.checkIfFilterAlreadyAdded(category.categoryId, filter.value);
            if (!filterAdded && filter.selected) {
                filter.selected = false;
            } else if (filterAdded && !filter.selected) {
                filter.selected = true;
            }
        });
        // Do not overwrite reference filters from selectedFilters here; this causes stale re-adds
        category.enableApplyBtn = false;
    };

};
