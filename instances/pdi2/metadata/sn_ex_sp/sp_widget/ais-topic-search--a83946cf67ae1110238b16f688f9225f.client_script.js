api.controller = function ($rootScope, $scope, $window, $timeout, $sanitize, i18n) {

  var c = this;
  var TRIGGER_FROM_TYPE = {
    LIST_ITEM: 'list-item',
    CLEAR: 'clear'
  };
  var ACTIVE_LIST_ITEM_SELECTOR = 'li.content-search-option[role="option"][aria-selected="true"]';
  var LIST_ITEM_TEXT_SELECTOR = 'li.content-search-option[data-index="{0}"]>a.ta-item .menu-text';
  var CLEAR_ICON_SELECTOR = 'li.content-search-option[data-index="{0}"]>a.ta-item i.fa-times-circle-o';
  var AUTOCOMPLETE_INPUT_SELECTOR = '#form-content-search input[name="ta-content-search"]';
  var REQUESTED_FIELDS = (c.options.requestedFields && typeof c.options.requestedFields === 'string') ? c.options.requestedFields : ("{\"kb_knowledge\": [\"number\", \"sys_updated_on\", \"image\"],\"sc_cat_item\": [\"name\", \"price\", \"sys_id\", \"picture\",\"type\", \"content_type\", \"recurring_frequency\", \"recurring_price\", \"kb_article\", \"url\" , \"sys_class_name\"], \"sn_lc_course_item\": [\"external_source\", \"estimated_duration\"]}").replaceAll('"', '\\\\\\"');
  c.data.size = c.options.size ? c.options.size : "md";
  c.data.typeaheadWaitMS = c.options.typeaheadWaitMS ? c.options.typeaheadWaitMS : 250;
  c.data.typeaheadMinLength = c.options.typeaheadMinLength ? c.options.typeaheadMinLength : "0";
  c.searchTerm = '';
  c.typeaheadLoading = false;
  $scope.searchResults = {};
  $scope.suggestionAnnouncement = "";



  var GraphAutoComplete = GraphAIS.AutoCompleteApi(c.options.searchConfigId, c.options.facet, c.options.filter);
  var GraphSearch = GraphAIS.SearchApi(c.options.searchConfigId, REQUESTED_FIELDS, c.options.facet, c.options.filter, c.options.sort, c.options.disableSpellCheck, c.data.isLocationTrackerDisabled, c.data.isWashington);

  var AIS_EVENTS = c.data.EVENTS;
  // Initialize AIS Params
  resetConfigToDefaults();

  $rootScope.$on('CONTENT_CARD_CLICKED', function(event, data) {
       if (!c.data.isWashington && c.aisSearchModeEnabled) {
           populateRankOfClickedItem(data.id, data.rank);
       }
  });

  var populateRankOfClickedItem = function(id, rank) {
        var clickedItem = $scope.searchResults.find(function(el) {
            return el.sysId === id;
        });
        if (clickedItem) {
            var clickedItemData = {
                searchApp: c.data.configId,
                searchTerm: c.searchTerm,
                sysId: id,
                aisDocId: clickedItem.aisDocId,
                title: clickedItem.title,
                table: clickedItem.table,
                signalType: 'CLICK',
                rank: rank
            };
            GraphAIS.SearchResultsAnalyticsApi(clickedItemData);
        }
 };

  var aisModeChangeDestroy = $rootScope.$on(AIS_EVENTS.AIS_MODE_CHANGE_EVENT, function (event, data) {
    c.aisSearchModeEnabled = data.searchModeEnabled;
    if (!c.aisSearchModeEnabled) {
      // clear out all config or reset to defaults
      resetConfigToDefaults();
    }
  });

  var refreshResultsDestroy = $rootScope.$on(AIS_EVENTS.AIS_REFRESH_RESULTS_EVENT, function (event, data) {
    $scope.setFilterFacetAndSortFields(data);
    if (!c.aisSearchModeEnabled) {
          $rootScope.$broadcast(AIS_EVENTS.AIS_MODE_CHANGE_EVENT, {
            searchModeEnabled: true,
          });
    }
    handleSearch(c.searchTerm, data.getNext);
  });

  $scope.$on('$destroy', function () {
    aisModeChangeDestroy();
    refreshResultsDestroy();
  });

  c.data.searchOptions = [];

  function resetConfigToDefaults() {
    c.data.configId = c.options.searchConfigId ? c.options.searchConfigId : '';
    c.data.facet = c.options.facet ? c.options.facet : [];
    c.data.filter = c.options.filter ? c.options.filter : [];
    c.data.sort = c.options.sort ? c.options.sort : [];
    c.data.action = '';
    c.data.results = [];
    c.data.spellCorrectedTerm = '';
    c.data.searchedTerm = '';
    c.data.disableSpellCheck = c.options.disableSpellCheck || false;
    c.data.hasNext = false;
    c.data.isAISloading = false;
    c.aisSearchModeEnabled = false;
    c.data.isError = false;
    c.data.dropdownHeader = '';
    c.searchTerm = '';
  }

  c.onSelect = function ($item, $modal, $label) {
    //do not fire event if already enabled
    if (!c.aisSearchModeEnabled) {
      $rootScope.$broadcast(AIS_EVENTS.AIS_MODE_CHANGE_EVENT, {
        searchModeEnabled: true,
      });
    }
	c.searchTerm = $label;
    GraphSearch.setSpellCheck(c.options.disableSpellCheck || false);
    handleSearch($label);
  };

  c.submitSearch = function () {
    if (!c.aisSearchModeEnabled && c.searchTerm.length === 0) {
      $('[name="ta-content-search"]').focus();
      return;
    }
    //do not fire event if already enabled
    if (!c.aisSearchModeEnabled) {
      $rootScope.$broadcast(AIS_EVENTS.AIS_MODE_CHANGE_EVENT, {
        searchModeEnabled: true
      });
    }
    GraphSearch.setSpellCheck(c.options.disableSpellCheck || false);
    handleSearch(c.searchTerm);
    if(c.data.isMobileApp) {
      $("#aisearch-mobile").blur();
    }
  };

  function handleSearch(search_term, next) {
    var fetchAllData = search_term === "***";
    search_term = search_term !== '' ? search_term : '***';
    var unescapedSearchTerm = search_term;
    search_term = $scope.escapeSpecialChars(search_term);
    // Broadcast - loading data
    c.data.isAISloading = true;
    $rootScope.$broadcast(AIS_EVENTS.AIS_LOADING_EVENT, {
      isAISloading: c.data.isAISloading,
      searchedTerm: c.searchTerm,
      loadingNext: next
    });
    // Fetching data
    // Getting new data
    var searchFn = GraphSearch.search;
    if (next && GraphSearch.hasNext()) {
      //requesting next paginated data
      searchFn = GraphSearch.next;
    }

    c.getSortAndFilterOptions().then(function (response) {
      c.filterOptions = response[0];
      c.sortOptions = response[1];
      var returnSearchTerm = unescapedSearchTerm;
      if(!fetchAllData && search_term === "***"){
        returnSearchTerm = '';
      }
      searchFn(search_term).then(function (response) {
        c.updateResults(response, returnSearchTerm);
      }).catch(function (err) {
        c.updateResults([], returnSearchTerm, err);
      });
    });
  }

  c.sendErrorResponse = function () {
    // Broadcast - loading done
    c.data.isAISloading = false;
    $rootScope.$broadcast(AIS_EVENTS.AIS_LOADING_EVENT, {
      isAISloading: c.data.isAISloading,
      searchedTerm: c.searchTerm
    });
  };

  c.updateResults = function (response, search_term, err) {
    c.data.results = response;
    $scope.searchResults = response;
    c.data.error = err;
    c.data.searchedTerm = search_term;
    c.data.spellCorrectedTerm = GraphSearch.getSpellCorrectedTerm();
    c.data.hasNext = GraphSearch.hasNext();
    c.data.filterOptions = c.filterOptions;
    c.data.sortOptions = c.sortOptions;

    $rootScope.$broadcast(AIS_EVENTS.AIS_RESULTS_UPDATED_EVENT, c.data);
    // Broadcast - loading done
    c.data.isAISloading = false;
    $rootScope.$broadcast(AIS_EVENTS.AIS_LOADING_EVENT, {
      isAISloading: c.data.isAISloading,
      searchedTerm: c.searchTerm,
      loadingNext: false
    });
  };

  c.getSearchSuggestions = function ($viewValue) {
    return GraphAutoComplete.getAutoComplete($viewValue).then(function (response) {
      var flattenedSuggestions = response.flatMap(function(group){
        return group.records.map(function(record){
          var modifiedRecord = {};
          modifiedRecord = record;
          modifiedRecord.name = group.name;
          return modifiedRecord;
        });
      });
      var allSuggestionsByTypes = _.groupBy(flattenedSuggestions, 'type');
      var searchHistory = allSuggestionsByTypes['USER_HISTORY'];
      var suggestedItems = [];
      Object.keys(allSuggestionsByTypes).forEach(function (key) {
        if (key !== 'USER_HISTORY')
        suggestedItems = suggestedItems.concat(allSuggestionsByTypes[key]);
      });
      suggestedItems = _.uniqBy(suggestedItems,function(x){ 
        var xValue = x.columns.find(function (col) {
          return col.fieldName === "name";
        }).value;
        return x.type+"#"+xValue;
      });

      var showClear = true;
      var searchHistoryOptions = c.processAutocompleteOptions(searchHistory, showClear);
      showClear = false;
      var suggestedItemsOptions = c.processAutocompleteOptions(suggestedItems, showClear);

      c.data.searchOptions = $viewValue ? suggestedItemsOptions : searchHistoryOptions;
      c.data.searchOptions = c.data.searchOptions.map(function(item, index){
        item.name = c.replaceEscapeString($scope.decodeHtmlEntities($sanitize(item.name)));

        return Object.assign({item_index : index}, item);
      });

      var searchOptionByTypes = _.groupBy(c.data.searchOptions, 'type');

      Object.keys(searchOptionByTypes).forEach(function (key) {
        if (key === 'USER_HISTORY' || key === 'USER_HISTORY_AND_CLICK')
          searchOptionByTypes[key] = c.data.OPTION_TYPES[key];
        else
          searchOptionByTypes[key] = c.data.suggestedResults;
      });

      c.data.modified = searchOptionByTypes;
      c.announceSearchSuggestions(c.data.searchOptions);
      return c.data.searchOptions;
    });
  };

    c.announceSearchSuggestions = function(suggestedOptions) {
        if (suggestedOptions && suggestedOptions.length > 0) {
            var msg = "";
            $scope.suggestionAnnouncement = msg;
            if (suggestedOptions.length == 1) {
                msg = '${Showing 1 result}';
            } else {
                i18n.getMessage("Showing {0} results", function(translatedMsg) {
                    msg = translatedMsg.withValues([suggestedOptions.length]);
                });
            }
            $timeout(function() {
                $scope.suggestionAnnouncement = msg;
            }, 250);
        }
    };

  c.processAutocompleteOptions = function (options, showClear) {
    if (!options || options.length < 0)
      return [];
    return options.map(function (item) {
      var optData = {};
      optData.name = item.columns.find(function (col) {
        return col.fieldName === "name";
      }).displayValue;
      optData.name = c.unescapeString(optData.name);
      optData.type = item.type;
      optData.glyph = 'search';
      optData.showClear = showClear;
      return optData;
    });
  };
  c.unescapeString = function(str) {
    return str.replace(/\\/g, "");
  }

  c.replaceEscapeString = function(str) {
    return c.unescapeString(str)
        .replace(/\t/g, " ")
        .replace(/\n/g, " ");
  }

  c.getSortAndFilterOptions = function () {
    return Promise.all([GraphSearch.getFilters(), GraphSearch.getSortOptions()]);
  }

  $scope.decodeHtmlEntities = function(str){
    // Create a temporary DOM element
    var textArea = document.createElement('textarea');
    // Set the value of the textarea to the input string
    textArea.innerHTML = str;
    // Return the decoded text from the textarea
    return textArea.value;
  }

  $scope.escapeSpecialChars = function (jsonStr) {
    return jsonStr.replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/"/g, '\\\\\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\t/g, " ")
      .replace(/\n/g, " ")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f");
  }

  $rootScope.clearSuggestions = function ($event, currentMatch) {
    var currentSearchTerm = currentMatch.model.name;

    GraphAutoComplete.clearSearchFromHistory(currentSearchTerm).then(function (response) {
      if (response && response === currentSearchTerm) {
        $('[name="ta-content-search"]').focus();
      }
    }).catch(function (err) {
      $('#form-content-search')[0].click();
    });
  };

  $scope.inputKeydown = function ($event) {
    var currentActiveIndex = 0;
    var currentActive = $(ACTIVE_LIST_ITEM_SELECTOR);
    if (currentActive[0] && currentActive[0].dataset.index) {
      currentActiveIndex = Number(currentActive[0].dataset.index);
    }
    var focusIndex = $event.focusIndex ? $event.focusIndex : currentActiveIndex;
    switch ($event.which) {
      //up & down
      case 38:
      case 40:
        $timeout(function () {
          if ($event.triggerFrom === TRIGGER_FROM_TYPE.CLEAR || $event.triggerFrom === TRIGGER_FROM_TYPE.LIST_ITEM)
            return;
          $(LIST_ITEM_TEXT_SELECTOR.replace(/\{0\}/g, focusIndex))[0].focus();
        });
        break;
      default:
        break;
    }
  };

  $rootScope.listItemAccessibility = function ($event, currentIndex) {
    $scope.handleAccessibilityNav($event, currentIndex, TRIGGER_FROM_TYPE.LIST_ITEM);
  };

  $rootScope.clearIconAccessibility = function ($event, currentIndex) {
    $scope.handleAccessibilityNav($event, currentIndex, TRIGGER_FROM_TYPE.CLEAR);
  };

  $scope.getTotalOptions = function () {
    return $('#form-content-search li[role="option"].content-search-option').length;
  };

  $scope.handleTab = function () {
    $timeout(function () {
      $('#form-content-search')[0].click();
      $('#form-content-search button[name="ta-search"]')[0].focus();
    });
  };

  $scope.handleAccessibilityNav = function ($event, currentData, type) {
    $event.preventDefault();
    var totalOptions = $scope.getTotalOptions(), currentMatchID = [], currentIndex = 0;
    if (type === TRIGGER_FROM_TYPE.LIST_ITEM) {
      currentIndex = currentData;
    }
    else if (type === TRIGGER_FROM_TYPE.CLEAR) {
      currentMatchID = currentData.id.split('-');
      currentIndex = Number(currentMatchID[currentMatchID.length - 1]);
    }
    currentIndex = Number(currentIndex.toString().replace(/^0+/, ''));
    var previous = currentIndex === 0 ? totalOptions - 1 : currentIndex - 1,
      next = currentIndex === totalOptions - 1 ? 0 : currentIndex + 1;

    var focusIndex = ($event.which === 37 || $event.which === 38) ? previous : next;

    switch ($event.which) {
      //left & right
      case 37:
      case 39:
        $scope.handleLeftRightArrowPress(currentIndex, focusIndex, type, currentMatchID, $event.which);
        break;
      //up & down
      case 38:
      case 40:
        $scope.handleUpDownArrowPress(currentIndex, focusIndex, type, currentMatchID, $event.which);
        break;
      //tab
      case 9:
        $scope.handleTab();
        break;
      //enter & space
      case 13:
      case 32:
        document.activeElement.click();
        break;
      default:
        break;
    }
  };

  //Keycode 38(up) & 40(down)
  $scope.handleUpDownArrowPress = function (currentIndex, focusableIndex, type, currentMatchIDArr, keyCode) {
    var elementToFocus = '';
    if (type === TRIGGER_FROM_TYPE.LIST_ITEM) { 
      elementToFocus = LIST_ITEM_TEXT_SELECTOR.replace(/\{0\}/g, focusableIndex); 
    }
    else if (type === TRIGGER_FROM_TYPE.CLEAR) {
      elementToFocus = CLEAR_ICON_SELECTOR.replace(/\{0\}/g, focusableIndex);
    }

    $timeout(function () {
      if (currentIndex === 0 && keyCode === 38) {
        $(AUTOCOMPLETE_INPUT_SELECTOR)[0].focus();
        return;
      }
      $(elementToFocus)[0].focus();
      var e = $.Event('keydown');
      e.which = keyCode;
      e.focusIndex = focusableIndex;
      if (type === TRIGGER_FROM_TYPE.CLEAR) {
        e.triggerFrom = TRIGGER_FROM_TYPE.CLEAR;
      }
      $(AUTOCOMPLETE_INPUT_SELECTOR).trigger(e);
    });
  };

  //Keycode 37(left) & 39(right)
  $scope.handleLeftRightArrowPress = function (currentIndex, focusableIndex, type, currentMatchIDArr, keyCode) {
    var elementToFocus = '';
    if (type === TRIGGER_FROM_TYPE.LIST_ITEM) { 
      elementToFocus = CLEAR_ICON_SELECTOR.replace(/\{0\}/g, (keyCode === 39 ? currentIndex : focusableIndex));
    }
    else if (type === TRIGGER_FROM_TYPE.CLEAR) {
      elementToFocus = LIST_ITEM_TEXT_SELECTOR.replace(/\{0\}/g, (keyCode === 39 ? focusableIndex : currentIndex));
    }
    $timeout(function () {
      $(elementToFocus)[0].focus();
      if ((type === TRIGGER_FROM_TYPE.LIST_ITEM && keyCode === 37) || (type === TRIGGER_FROM_TYPE.CLEAR && keyCode === 39)) {
        var e = $.Event('keydown');
        e.which = keyCode === 39 ? 40 : 38;
        e.focusIndex = focusableIndex;
        e.triggerFrom = type;
        $(AUTOCOMPLETE_INPUT_SELECTOR).trigger(e);
      }
    });
  };

  $scope.isTouchDevice = function () {
    return ('ontouchstart' in $window);
  };

  $scope.setFilterFacetAndSortFields = function(data) {
    if (data.facet) {
      GraphAutoComplete.setFacet(data.facet);
      GraphSearch.setFacet(data.facet);
    }

    if (data.filter) {
      GraphAutoComplete.setFilter(data.filter);
      GraphSearch.setFilter(data.filter);
    }

    if (data.sort) {
      GraphSearch.setSort(data.sort);
    }

    if (data.fields) {
      GraphSearch.setFields(data.fields);
    }

    if (data.spellCheck) {
      GraphSearch.setSpellCheck(data.spellCheck);
    }

    c.searchTerm = data.searchQuery ? data.searchQuery : c.searchTerm;
  }

  $rootScope.$on(AIS_EVENTS.AIS_RESET_FILTERS_FACETS_AND_SORT, function (event, data) {
    c.searchTerm = '';
    $scope.setFilterFacetAndSortFields(data);
  });
};
