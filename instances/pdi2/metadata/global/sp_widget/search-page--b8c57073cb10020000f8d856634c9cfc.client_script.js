function ($scope, $window, $location, spUtil, $rootScope) {
	spUtil.setSearchPage($scope.data.t);
	$scope.showScore = $scope.options.show_score == 'true' || $scope.options.show_score == true;
	$scope.latitude = null;
	$scope.longitude = null;
	$scope.isLocationTrackerDisabled = $scope.data.isLocationTrackerDisabled === "true";
    $window.document.title = $scope.data.q + ' ' + $scope.page.static_title + (!$scope.portal.hide_portal_name ? ' - ' + $scope.portal.title : '');
	$scope.getBGImage = function(item) {
		return {"background-image": "url('" + item.picture + "')"};
	}

	$scope.search = function(searchTerm) {
		$location.search('q', searchTerm);
	}

	$scope.highlight = function(haystack, needle) {
		if (!haystack)
			return "";

		if (!needle)
			return haystack;

		return haystack.replace(new RegExp(needle.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "gi"), function(match) {
			return '<mark class="highlight mark">' + match + '</mark>';
		});
	}

	$scope.escapeHTML = function(value) {
		var entityMap = {
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': '&quot;',
					"'": '&#39;',
					"/": '&#x2F;'
				};
		if (!value) return value;
		value = String(value).replace(/[&<>"'\/]/g, function (s) {
        		return entityMap[s];
        	});

		return value;
	}

	function setUserLocationCoords(cb) {
		var onSuccess = function(pos) {
			return cb({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			})
		};

		var onError = function() {
			return cb({
				latitude: null,
				longitude: null	
			});
		};

		if (window.navigator.geolocation) {
			window.navigator.geolocation.getCurrentPosition(onSuccess, onError, {
			enableHighAccuracy: true
		});
	}
	}

	if(!$scope.isLocationTrackerDisabled){
		setUserLocationCoords(function(coords) {
			$scope.latitude = coords.latitude;
			$scope.longitude = coords.longitude;
			
			// Track Search Event with Location coordinates
			trackSearchEvent();

		});
	} else {
		//Track Search Event without location coordinates
		trackSearchEvent();
	}
	
	function trackSearchEvent() {
		var c = $scope;

		var payload =  {
			query: _.get(c, 'data.q'),
			portal_id: _.get(c, 'portal.sys_id'),
			page_id: _.get($window, 'spSearchAnalytics.page_id', c.page.id),
			refinement_occurred: false, // refinement cannot occur in this widget since no facets are available
			browser_info: $window.navigator.userAgent,
			location: {
				latitude: $scope.latitude,
				longitude: $scope.longitude
			},
			search_results: getSearchResultsSignals($scope),
			results_per_source: getSearchSources($scope)
		}

		var payloadObject = {
			action: "GlideSPSearchAnalytics",
			payload: payload
		};
		c.server.get(payloadObject);
	}

	function getSearchSources($scope) {
		var c = $scope;
		var sources = {};
		if (c.data.t) {
			sources[c.data.t] = 0;
		}
		else {
			c.data.searchSources.map(function(key) {
				sources[key] = 0;
			});
		}
		$scope.data.results.map(function(item) {
			var sourceId = _.get(item, 'type');
			if (sources[sourceId])
				sources[sourceId]++;
			else
				sources[sourceId] = 1;
		});
		var searchSources = [];
		Object.keys(sources).map(function(key) {
			var source_id = c.data.searchSourceConfiguration[key];
			searchSources.push({
				source_id: source_id,
				number_of_results: sources[key]
			});
		});
		return searchSources;
	}

	function getSearchResultsSignals($scope) {
		return $scope.data.results.map(function(item) {
			var recordId = item.sys_id;
			var tableName = item.table;
			
			return {
				record_id: recordId,
				table_name: tableName
			};
		});
	}

	function pageChanged(newUrl, oldUrl) {
		var newUrlParams = newUrl.match(/id=.+/),
		oldUrlParams = oldUrl.match(/id=.+/);

		if(!newUrlParams && !oldUrlParams) {
			return false;
		}

		if((!newUrlParams && oldUrlParams) || (newUrlParams && !oldUrlParams)) {
			return true;
		}

		return newUrlParams[0].split("&")[0] !== oldUrlParams[0].split("&")[0];
	}

	function getResultDescription(result){
		var description = null;
		if(result.name != null)
			description = result.name;
		else if(result.primary != null)
			description = result. primary;
		else if(result.sec_title != null)
			description = result.sec_title;
		return description;
	}

	function trackSearchResultClicked(resultClicked, rank) {
		if (!rank || rank < 1) return ;
		var c = $scope;
		var query = _.get(c.data, 'q');
		var results = _.get(c.data, 'results', []);
		
		var result = results.find(function(e) {
			  return e.primary.trim() === resultClicked.trim();
		});
	
		var sourceTable = result.table != null ? result.table : null;

		var payloadObject = {
			action: "GlideSPSearchAnalytics",
			payload: {
				query: query,
				portal_id: c.portal.sys_id,
				page_id: $scope.page && $scope.page.id,
				results_per_source: getSearchSources(c),
				refinement_occurred: false,
				browser_info: $window.navigator.userAgent,
				location: {
					latitude: $scope.latitude,
					longitude: $scope.longitude
				},
				result_event_sys_id : result.sys_id,
				label_description : getResultDescription(result),
				source_table: sourceTable,
				signal_type: "CLICK",
				signal_value: rank
			}
		};

		$window.spSearchAnalytics = {
			query: query
		};

		c.server.get(payloadObject);
	}
	
	// Event delegation for Updating click rank
	$(".panel").on('click', '.result-item a', function(e) {
		var index = $(e.currentTarget).parent().parent().data('index');
		var resultClicked = e.currentTarget.innerText;
		trackSearchResultClicked(resultClicked, index+1);
	});
	
}
