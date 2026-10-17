api.controller = function($scope, $timeout, i18n) {
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
    c.showMoreLessButtons = false;

    c.init = function() {
        c.view = 'desktop';
        if (c.data.isMobile || $('.sp-page-root').width() < 768) {
            c.view = 'mobile';
        }
        c.updateCategoryWithFilterGroup();
        if (c.data.preselectedFilters && c.data.preselectedFilters.length > 0) {
            c.applyPreselectedFilters(c.data.preselectedFilters);
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

    c.updateCategoryWithFilterGroup = function() {
        c.filtersData.forEach(function(category) {
            var isFilterGroupPresent = category.filters.some(function(filter) {
                return filter.isGroup == true;
            });
            if (isFilterGroupPresent) {
                category.isFilterGroupPresent = true;
            }
        });
    };

    c.applyPreselectedFilters = function(preselectedFilters) {
        var categoryData = {};
        preselectedFilters.forEach(function(filterId) {
            var category = c.getCategoryForFilter(filterId);
            if(category) {
                if (categoryData[category.categoryId]) {
                   categoryData[category.categoryId].filters.push(filterId);
                } else {
                   categoryData[category.categoryId] = {
                      category: category,
                      filters: [filterId]
                   };
                }	
            }
            
        });
        var categoryList = Object.keys(categoryData);

        categoryList.forEach(function(catId) {
            categoryData[catId].category.filters.forEach(function(filter) {
                var filterFound = categoryData[catId].filters.find(function(filterId) {
                    return filterId == filter.filterId;
                });
                if (filterFound) {
                    filter.selected = true;
                    categoryData[catId].category.enableClearBtn = true;
                }
            });
            c.applyFilter(categoryData[catId].category);
        });
    };

    c.getCategoryForFilter = function(filterId) {
        for (var i = 0; i < c.filtersData.length; i++) {
            var category = c.filtersData[i];
            for (var j = 0; j < category.filters.length; j++) {
                if (category.filters[j].filterId == filterId) {
                    return category;
                }
            }
        }
    };

    c.expandFilters = function(category, filter) {
        category.filters.forEach(function(f) {
            if (f.filterId == filter.filterId) {
                f.expand = !f.expand;
            }
        });
    };

    c.onFilterValueChange = function(category, filter, subfilter, isMobile) {
        if (isMobile) {
            c.enableApplyBtn = true;
            c.enableClearBtn = true;
        } else {
            category.enableClearBtn = true;
            category.enableApplyBtn = true;
        }
        // when filter group is clicked
        if (!subfilter && filter.subFilters && filter.subFilters.length > 0) {
            if (filter.selected == false && c.areSomeSubfilterSelected(filter)) {
                filter.selected = true;
                filter.subFilters.forEach(function(subfilter) {
                    subfilter.selected = true;
                });
            }
            filter.subFilters.forEach(function(subfilter) {
                subfilter.selected = filter.selected;
            });
            return;
        }
        if (subfilter) {
            if (subfilter.selected) {
                filter.selected = true;
            } else {
                var isAnySubfilterSelected = filter.subFilters.some(function(sf) {
                    return sf.selected == true;
                });
                if (!isAnySubfilterSelected) {
                    filter.selected = false;
                }
            }
        }
    };

    c.areSomeSubfilterSelected = function(filter) {
        if (!filter.subFilters) {
            return false;
        }
        var selectedSubFilters = filter.subFilters.filter(function(subfilter) {
            return subfilter.selected == true;
        });
        return (selectedSubFilters.length > 0 && (filter.subFilters.length > selectedSubFilters.length));
    };

    c.clearFilters = function(category, event) {
        category.enableClearBtn = false;
        category.enableApplyBtn = true;
        category.filters.forEach(function(filter) {
            filter.selected = false;
            if (filter.subFilters) {
                filter.subFilters.forEach(function(subfilter) {
                    subfilter.selected = false;
                });
            }
        });
    };

    c.applyFilter = function(category) {
        category.enableApplyBtn = false;
        if (updateFilterPills(category)) {
            $scope.$emit('sn_ex_sp.applyFilters', c.filtersData);
        }
    };

    c.clearPill = function(pill) {
        var category = removeFilterPill(pill.categoryId, pill.filterId, pill.subfilterId);
        c.updateDraftFilters(category);
        updateCategorySelectedFilters(category);
        updateAppliedFilterPillsHeight(true);
        if (category.selectedFilters.length == 0) {
            category.enableClearBtn = false;
            category.enableApplyBtn = false;
        }
        $scope.$emit('sn_ex_sp.applyFilters', c.filtersData);
    };

    function updateCategorySelectedFilters(category) {
        var selectedFiltersList = [];
        category.filters.forEach(function(filter) {
            if (filter.selected) {
                if (!filter.isGroup) {
                    selectedFiltersList.push({
                        filterId: filter.filterId,
                        configConditions: filter.configConditions
                    });
                } else if (filter.subFilters) {
                    filter.subFilters.forEach(function(subfilter) {
                        if (subfilter.selected) {
                            selectedFiltersList.push({
                                filterId: subfilter.filterId,
                                configConditions: subfilter.configConditions
                            });
                        }
                    });
                }
            }
        });
        category.selectedFilters = selectedFiltersList;
    }

    c.clearAllPills = function() {
        c.resetFilters();
        $scope.$emit("sn_ex_sp.AllFiltersCleared", {
            allCleared: true
        });
    };

    c.resetFilters = function() {
        c.filtersData.forEach(function(category) {
            category.enableClearBtn = false;
            category.filters.forEach(function(filter) {
                filter.selected = false;
                if (filter.subFilters) {
                    filter.subFilters.forEach(function(subfilter) {
                        subfilter.selected = false;
                    });
                }
            });
            category.filterCount = 0;
            category.selectedFilters = [];
        });
        $scope.$emit('sn_ex_sp.applyFilters', c.filtersData);
        c.filterPills = [];
        c.enableClearBtn = false;
    };

    function updateFilterPills(category) {
        var categoryId = category.categoryId;
        var selectedFiltersData = {};
        var selectedFiltersList = [];
        var prevSelectedFilters = category.selectedFilters;

        category.filters.forEach(function(filter) {
            if (filter.selected) {
                if (!filter.isGroup) {
                    addFilterPill(filter.filterName, categoryId, filter.filterId);
                    selectedFiltersList.push({
                        filterId: filter.filterId,
                        configConditions: filter.configConditions
                    });
                }
            } else {
                removeFilterPill(categoryId, filter.filterId);
            }

            if (filter.subFilters) {
                filter.subFilters.forEach(function(sf) {
                    if (sf.selected) {
                        addFilterPill(sf.filterName, categoryId, filter.filterId, sf.filterId);
                        selectedFiltersList.push({
                            filterId: sf.filterId,
                            configConditions: sf.configConditions
                        });
                    } else {
                        removeFilterPill(categoryId, filter.filterId, sf.filterId);
                    }
                });
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
                if (prevSelectedFilters[i].filterId !== currSelectedFiltersList[i].filterId) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    function addFilterPill(name, categoryId, filterId, subfilterId) {
        if (!c.checkIfFilterAlreadyAdded(categoryId, filterId, subfilterId)) {
            var pillId = subfilterId ? (categoryId + '-' + filterId + '-' + subfilterId) : (categoryId + '-' + filterId);
            c.filterPills.push({
                id: pillId,
                value: name,
                categoryId: categoryId,
                filterId: filterId,
                subfilterId: subfilterId,
                clearLabel: i18n.format(c.data.clearLabel, name)
            });
            c.enableClearBtn = true;
            return true;
        }
        return false;
    }

    function removeFilterPill(categoryId, filterId, subfilterId) {
        var category = c.getCategory(categoryId);
        var filter = category.filters.find(function(f) {
            return (f.filterId == filterId);
        });
        if (!subfilterId) {
            filter.selected = false;
        } else {
            var subfilter = filter.subFilters.find(function(sub) {
                return (sub.filterId == subfilterId);
            });
            subfilter.selected = false;
            if (!c.areSomeSubfilterSelected(filter)) {
                filter.selected = false;
            }
        }
        var pillId = subfilterId ? (categoryId + '-' + filterId + '-' + subfilterId) : (categoryId + '-' + filterId);
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

    c.checkIfFilterAlreadyAdded = function(categoryId, filterId, subfilterId) {
        var filterPills = c.filterPills;
        var filterPillsLen = filterPills.length;

        if (filterPillsLen.length === 0) {
            return false;
        }
        for (var pIdx = 0; pIdx < filterPillsLen; pIdx++) {
            var pillId = subfilterId ? (categoryId + '-' + filterId + '-' + subfilterId) : (categoryId + '-' + filterId);
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
            $scope.$emit('sn_ex_sp.applyFilters', c.filtersData);
        }
        $timeout(updateAppliedFilterPillsHeight, 0);
    };

    clearAllFiltersMobile = function() {
        $scope.$apply(function() {
            c.enableClearBtn = false;
            c.enableApplyBtn = true;
            c.filtersData.forEach(function(category) {
                category.filters.forEach(function(filter) {
                    filter.selected = false;
                    if (filter.subFilters) {
                        filter.subFilters.forEach(function(subfilter) {
                            subfilter.selected = false;
                        });
                    }
                });
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
        var label = (filter.isGroup) ? '${Filter group} ' : '${Filter} ';
        return label + filter.filterName;
    };

    // resets filter based on pills when clicked closed modal/dropdowns without save
    c.updateDraftFilters = function(category) {
        category.filters.forEach(function(filter) {
            if (category.selectedFilters.length > 0) {
                category.enableClearBtn = true;
            }
            var filterAdded = c.checkIfFilterAlreadyAdded(category.categoryId, filter.filterId);
            if (!filter.isGroup) {
                if (!filterAdded && filter.selected) {
                    filter.selected = false;
                } else if (filterAdded && !filter.selected) {
                    filter.selected = true;
                }
            }

            if (filter.isGroup && filter.subFilters && filter.subFilters.length > 0) {
                var subFiltersAlreadyAddedCount = 0;
                filter.subFilters.forEach(function(subfilter) {
                    var subfilterAdded = c.checkIfFilterAlreadyAdded(category.categoryId, filter.filterId, subfilter.filterId);
                    if (subfilterAdded) {
                        subFiltersAlreadyAddedCount++;
                    }
                    if (!subfilterAdded && subfilter.selected) {
                        subfilter.selected = false;
                    } else if (subfilterAdded && !subfilter.selected) {
                        subfilter.selected = true;
                        filter.selected = true;
                    }
                });
                if (subFiltersAlreadyAddedCount == 0) {
                    filter.selected = false;
                }
                if (c.areSomeSubfilterSelected(filter)) {
                    filter.selected = true;
                }
            }
        });
        category.enableApplyBtn = false;
    };

};
