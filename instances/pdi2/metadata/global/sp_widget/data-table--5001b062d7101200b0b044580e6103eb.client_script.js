function ($scope, $location, $window, spUtil, amb, $http, spAriaUtil, $timeout, spNavStateManager, i18n, $element) {
	var c = this;
	/*
	 * options:
	 * hide_footer (bool) = true to remove the data table footer contents
	 * hide_header (bool) = true to remove the data table header contents
	 * show_new (bool) = true to show the "New" record button
	 * show_keywords (bool) = true to show the keyword search field
	 * table (string) = the table name to query
	 * filter (string) = the encoded query
	 * o (string) = the order by column
	 * d (string) = The order by direction: asc or desc
	 * p (int) = the page to jump to
	 * fields (string) = comma separated list of fields that become the list columns
	 * view (string) = the default view to load for columns, overrides fields
	*/
	$scope.accessibilityModeEnabled = spAriaUtil.isAccessibilityEnabled();
	$scope.exportTypes = [{label:'PDF', value: 'PDF'}, {label:'Excel', value:'EXCEL'}, {label:'CSV', value:'CSV'}];
	$scope.guID = spUtil.generateUniqueID();
	var keys = ['table', 'filter', 'p', 'o', 'd' , 'apply_to' , 'apply_to_sys_id' , 'relationship_id' ];
	
	var i18nMsgs = {
		filteredResults: i18n.getMessage('Filtered {0} list showing {1} to {2} of {3} records'),
		unFilteredResults: i18n.getMessage('Unfiltered {0} list showing {1} to {2} of {3} records'),
		filteredNoResults: i18n.getMessage('Filtered {0} list showing 0 records'),
		unFilteredNoResults: i18n.getMessage('Unfiltered {0} list showing 0 records')
	};

	var eventNames = {
		click: 'data_table.click',
		setFilter: 'data_table.setFilter',
		setKeywords: 'data_table.setKeywords'
	};

	$scope.go = function(table, item) {
		if ($window.getSelection().toString().length > 0)
			return;

		spNavStateManager.onRecordChange(table).then(function() {
		var parms = {};
		parms.table = table;
		parms.sys_id = item.sys_id;
		parms.record = item;
		$scope.ignoreLocationChange = true;
		for (var x in c.data.list) {
			c.data.list[x].selected = false;
		}
		item.selected = true;
		$scope.$emit(eventNames.click, parms);
		}, function() {
			// do nothing in case of closing the modal by clicking on x
		});	
	};
	
	$scope.handleKeydown = function (event) {
            if (event.key === 'Tab') 
               closeContextDropdownMenu(event.target);
	}
		
	function closeContextDropdownMenu(toggleButton) {
	    var dropdownSpan = $(toggleButton).closest('span.dropdown');
	    if (dropdownSpan && dropdownSpan.hasClass('open')) {
	        dropdownSpan.removeClass('open');
		toggleButton.setAttribute('aria-expanded', false);
	    }
	}

	$timeout(function() {
	    $(document).ready(function() {
	        var toggleButton = document.getElementById('optionsMenu-' + $scope.guID);
		if (!toggleButton) 
		    return;
		var dropdownMenu = toggleButton.nextElementSibling;
		if (dropdownMenu) {
		    dropdownMenu.addEventListener('focusout', function(event) {
		    if (!dropdownMenu.contains(event.relatedTarget)) 
			closeContextDropdownMenu(toggleButton);
		    });
		}
	    })
        });
	
	
	$scope.checkAndSetTinyUrl = function() {
	    var url = $scope.data.table + '_list.do?' + 'sysparm_query=' + $scope.data.exportQueryEncoded + '&sysparm_view=' + $scope.data.view + '&sysparm_fields=' + $scope.data.fields;
	    $scope.tinyUrlEnabled = c.data.useTinyUrl && url.length >= c.data.tinyUrlMinLength;
	    if ($scope.tinyUrlEnabled)
	        $scope.getTinyUrl(url);
	};

	$scope.getTinyUrl = function(url) {
	    $http.post('/api/now/tinyurl', {
	        url: url
	    }).then(function(response) {
	        $scope.tinyUrl = new URL($window.location.origin + '/' + response.data.result).searchParams.get('sysparm_tiny');
	    });
	};

	$scope.newRecord = function(){
		var parms = {
			id: 'form',
			table: $scope.data.table,
			view: $scope.data.view,
			sys_id: '-1'
		};
		if ($scope.data.exportQuery != '')
			parms.query = $scope.data.exportQuery;

		$location.search(parms);
	};

	function recoverStateFromUrl() {
		$scope.data.fields = [];
		var s = $location.search();
		for (var x in keys) {
			if (s[keys[x]]) {
				$scope.data[keys[x]] = s[keys[x]];
			}
		}
		$scope.server.update().then(function(data) {
			if (s.sys_id) {
				for (var x in data.list) {
					if (data.list[x].sys_id == s.sys_id) {
						$scope.go(s.table, data.list[x]);
					}
				}
			}
		});
	}

	if ($scope.options.fromUrl) {
		var origSearch = $location.search();
		$scope.$on('$locationChangeSuccess', function(e) {
			var s = $location.search();
			if (origSearch.id !== s.id)
				return;

			if ($scope.ignoreLocationChange){
				$scope.ignoreLocationChange = false;
				return;
			}

			// Helps to recover state when using the browser's back button
			recoverStateFromUrl();
		});
	}


	$scope.getNumber = function(num) {
		return new Array(num);
	}

	$scope.mathMin = function(v1,v2) {
		return Math.min(v1,v2);
	}

	function getData(updateUrl) {
		var f = $scope.data;
		spUtil.update($scope).then(function(data) {
			f.view = data.view;
			if ($scope.options.fromUrl && updateUrl)
				setPermalink(f.table, f.filter, f.o, f.d, f.p);

			if ($scope.options.show_breadcrumbs && data.filterBreadcrumbs)
				$scope.$broadcast('widget-filter-breadcrumbs.setBreadcrumbs', data.filterBreadcrumbs.data, data.filter);
			
			invokeResultsLiveMessage();
			initRecordWatcher(f.table, f.filter);
			$scope.checkAndSetTinyUrl();
		});
	}
	
	
	function invokeResultsLiveMessage(){
		var data = $scope.data;
		var totalRowCount = data.row_count;
		var startIndex = data.window_start+1;
		var endIndex = Math.min(data.window_end, totalRowCount);

		if (totalRowCount > 0)
			spAriaUtil.sendLiveMessage( (data.filter ? i18nMsgs.filteredResults : i18nMsgs.unFilteredResults).withValues([data.table_plural, startIndex, endIndex, totalRowCount]));	
		else
			spAriaUtil.sendLiveMessage( (data.filter ? i18nMsgs.filteredNoResults : i18nMsgs.unFilteredNoResults).withValues([data.table_plural]));
	}

	function setPermalink(table, filter, orderBy, orderDirection, page){
		$scope.ignoreLocationChange = true;
		var search = $location.search();
		angular.extend(search, {
			spa: 1,
			table: table,
			filter: filter,
			p: page,
			o: orderBy,
			d: orderDirection
		});
		$location.search(search);
	}

	var watcher;
	function initRecordWatcher(table, filter){
		if (watcher)
			watcher.unsubscribe();

		if (table && filter) {
			var watcherChannel = amb.getChannelRW(table, filter);
			amb.connect();
			watcher = watcherChannel.subscribe(function(message) {
				if (!message.data)
					return;
				switch(message.data.action) {
					case "change":
						updateRowFromRW(message);
						break;
					case "exit":
						// A record was removed
					case "enter":
						// A record was added
					default:
						spUtil.update($scope);
						break;
				}
			});
		}
	}

	function updateRowFromRW(message) {
		if (message.data && message.data.sys_id && $scope.data.list) {
			var row, field;
			for(var i=0;i<$scope.data.list.length; i++) {
				row = $scope.data.list[i];
				if (row.sys_id == message.data.sys_id) {
					var fields = Object.getOwnPropertyNames(message.data.record);
					for(var f in fields) {
						field = fields[f];
						if(typeof row[field] !== 'undefined') {
						    row[field].display_value = message.data.record[field].display_value;
						}
					}
				}
			}
		}
	}

	$scope.$on('$destroy', function() {
		if (watcher)
			watcher.unsubscribe();
	});

	$scope.$on('data_table.browser_back', function(event, data) {
		if (data && data.p) {
			$scope.data.p = data.p;
			getData(false);
		}
	});

	$scope.setPageNum = function(num) {
		$scope.data.p = num;
		getData(true);
		$timeout(function() {
			$scope.focusOnTableHeader();
		});

		$scope.$emit('data_table.page_changed', num);
	}

	$scope.getTitle = function (field) {
    	if (field === $scope.data.o) {
        	return $scope.data.d === 'asc' ? $scope.data.msg.sortingByAsc : $scope.data.msg.sortingByDesc;
    	}
    		return "";
	};

	$scope.setOrderBy = function(field,$event) {
		var d = "asc";
		// descending default sort for date/time columns for UI consistency
		var fieldType = $scope.data.column_types[field];
		if (fieldType == "glide_date_time" || fieldType == "glide_date")
			d = "desc";
		if ($scope.data.o == field) {
			if ($scope.data.d == "asc")
				d = "desc";
			else
				d = "asc";
		}

		if (d === "asc") {
			spAriaUtil.sendLiveMessage($scope.data.msg.sortingByAsc);
		} else if (d === "desc") {
			spAriaUtil.sendLiveMessage($scope.data.msg.sortingByDesc);
		}

		$scope.data.o = field;
		$scope.data.d = d;
		$scope.data.setOrderUserPreferences = true;
		$scope.setSearch(true);

		var element = angular.element($event.currentTarget).find('.th-title');
   		element.tooltip('hide');

		$timeout(function() {
			element.focus();
		}, 300);

	}

	$scope.setSearch = function(updateUrl) {
		$scope.data.p = 1;
		if ($scope.data.keywords) {
			var previousSearchTerm = $scope.previousSearchTerm;
			if (previousSearchTerm) {
			previousSearchTerm = '123TEXTQUERY321=' + previousSearchTerm;
			var previousSearchTermStartIndex = $scope.data.filter.indexOf(previousSearchTerm);
			var previousSearchTermEndIndex = previousSearchTermStartIndex + previousSearchTerm.length;
			if (previousSearchTermStartIndex >= 0)
				$scope.data.filter = $scope.data.filter.substr(0, previousSearchTermStartIndex) + $scope.data.filter.substr(previousSearchTermEndIndex + 1, $scope.data.filter.length);
			}
			$scope.previousSearchTerm = $scope.data.keywords;
		}
		getData(updateUrl);
	}

	$scope.$on(eventNames.setFilter, function(e, newFilter){
		$scope.data.filter = newFilter;
		$scope.setSearch(false);
	});

	$scope.$on(eventNames.setKeywords, function(e, keywords){
		$scope.data.keywords = keywords;
		$scope.setSearch(false);
	});

	$scope.$on('widget-filter-breadcrumbs.queryModified', function(e, newFilter){
		$scope.data.filter = newFilter;
		$scope.setSearch(true);
	});

	$scope.rowsWerePruned = function() {
		if (!$scope.data.list)
			return;

		$scope.rowsPruned = $scope.mathMin($scope.data.window_end,$scope.data.row_count) - $scope.data.window_start - $scope.data.list.length;
		return $scope.rowsPruned > 0;
	}

	$scope.showFilter = function() {
		return !$scope.data.list.length && !$scope.data.num_pages && !$scope.data.invalid_table && !$scope.loadingData;
	}

	c.appendQuery = function(query){
		if ($scope.data.filter.length > 1)
			$scope.data.filter += '^';
		$scope.data.filter += query;
			$scope.setSearch();

	}

	// Makes Widget Async
	$scope.data = $scope.options;
	$scope.loadingData = true;
	$scope.server.update().then(function() {
		if ($scope.data.newButtonUnsupported)
			console.log("Service Portal: New button not supported for sys_attachment list");
		$scope.loadingData = false;
		initRecordWatcher($scope.data.table, $scope.data.filter);
		$scope.checkAndSetTinyUrl();
	});

	function parseQuery(table, queryString){
		return $http.post('/api/now/sp/parsequery/' + table, queryString).then(function(response){
				return response.data.result;
		});
	}

	c.createQueryTerm = function(table, field, sys_id, operator){
		return $http.get('/api/now/sp/getInOutQueryTerm', {
			params: {
				table: table,
				sys_id: sys_id,
				field: field,
				operator: operator
			}
		}).then(function(response){
			if (response && response.data && response.data.result)
				return response.data.result.parts;
		});
	}

	c.isMultiPart = function(terms) {
		for (var i = 0; i < terms.length; i++) {
			var term = terms[i];
			while (term.left)
				term = term.left;
			if (term.NQ)
				return true;
		}
		return false;
	}
	
	c.showMatching = function(field, newTerm) {
		var queryString = $scope.data.filter;
		var eq = "";
		parseQuery($scope.data.table, queryString).then(function(oldTerms) {
			var isMultiPart = c.isMultiPart(oldTerms);
			for (var i = 0; i < oldTerms.length; i++) {
				var term = oldTerms[i];
				if (!isMultiPart && isSameField(newTerm, term))
					continue;

				if (eq.length)
					eq += '^';

				// term may be separated into nested "left" and "right" bits,
				// follow the lefts to the bottom where "NQ" might be specified
				var termNQCheck = oldTerms[i];
				while (termNQCheck.left)
					termNQCheck = termNQCheck.left;
				if (termNQCheck.NQ) {
					// query is multipart so apply new term to each part
					eq += getEncodedTerm(newTerm);
					eq += "^NQ";
				}
				eq += getEncodedTerm(term);
			}
			if (eq.length)
				eq += '^';
			eq += getEncodedTerm(newTerm);

			$scope.data.filter = eq;
			$scope.setSearch();
			$location.search(angular.extend($location.$$search, {spa: 1, filter: eq, p: $scope.data.p}));
		});
	};

	c.filterOut = function(field, newTerm) {
		var eq = "";
		if ($scope.data.filter.indexOf("^NQ") == -1) {
			// don't need server roundtrip to parse query,
			// can just append the new term
			eq = $scope.data.filter;
			if (eq.length)
				eq += '^';
			eq += getEncodedTerm(newTerm);
			$scope.data.filter = eq;
			$scope.setSearch();
			$location.search(angular.extend($location.$$search, {spa: 1, filter: eq, p: $scope.data.p}));
			return;
		}
		
		// query may be multipart so must apply new term to each part
		var queryString = $scope.data.filter;
		parseQuery($scope.data.table, queryString).then(function(oldTerms) {
			for (var i = 0; i < oldTerms.length; i++) {
				var term = oldTerms[i];
				if (eq.length)
					eq += '^';

				// term may be separated into nested "left" and "right" bits,
				// follow the lefts to the bottom where "NQ" might be specified
				var termNQCheck = oldTerms[i];
				while (termNQCheck.left)
					termNQCheck = termNQCheck.left;
				if (termNQCheck.NQ) {
					// query is multipart so apply new term to end of each part
					eq += getEncodedTerm(newTerm);
					eq += "^NQ";
				}
				eq += getEncodedTerm(term);
			}
			if (eq.length)
				eq += '^';
			eq += getEncodedTerm(newTerm);

			$scope.data.filter = eq;
			$scope.setSearch();
			$location.search(angular.extend($location.$$search, {spa: 1, filter: eq,}));
		});
	};

	function isSameField(t1, t2) {
		if ('left' in t1 && 'left' in t2)
			return t1.left.query_term_field === t2.left.query_term_field;
		else if ('left' in t1)
			return t1.left.query_term_field === t2.query_term_field;
		else if ('left' in t2)
			return t1.query_term_field === t2.left.query_term_field;
		return t1.query_term_field === t2.query_term_field;
	}

	function getEncodedTerm(term) {
		var eq;
		if (term.left) {
			eq = getEncodedTerm(term.left);
			eq += '^OR';
			eq += getEncodedTerm(term.right);
		} else {
			eq = term.query_term_field;
			eq += term.operator;
			eq += term.value;
		}
		return eq;
	}

	// Initialize keyboard navigation for data table hamburger menu after DOM is ready
	$timeout(function() {
		// Use $element to scope the search to this specific widget instance
		var optionsMenuElement = $element.find('#optionsMenu-' + $scope.guID).parent();
		if (optionsMenuElement.length > 0) {
			spAriaUtil.initDropdownKeyboardNav(optionsMenuElement);
		}
	});
}
