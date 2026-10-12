angular.module("sn.app_common.aisa.search", ["sn.app_common"]);
angular.module("sn.app_common.aisa.search").service("aisaSearch", ["$http", "$q", "$log", function($http, $q, $log) {
	var aisaSearch = this;

	this.AISA_SEARCH_ENDPOINT = "/api/now/aisa/search";

	// Definition of the client side SearchRequest
	var SearchRequest = function(requestData) {
		var searchRequest = {
			method: 'POST',
			url: aisaSearch.AISA_SEARCH_ENDPOINT,
			headers: {
				'Content-Type': "application/json; charset=UTF-8"
			},
			data: {
					"searchContextConfigId":requestData.searchApp,
					"requestedFields": requestData.requestedFields,
					"searchTerm": requestData.searchTerm,
					"rpSysId": requestData.rpSysId
			}
		};
		// Deep copy of request.  Stops dot walking inadvertantly modifying different requests.
		angular.copy(searchRequest, this);

		this.submit = function() {
			return aisaSearch.submit(this);
		};
	};

	// Definition of the client side SearchResponse
	var SearchResponse = function(responseData) {
		var searchAPIResponse = {};
		try {
			searchAPIResponse = responseData.data.result;
			searchAPIResponse.status = responseData.status;
		} catch (e) {
			searchAPIResponse = {
				status: 500,
				error: "Server Internal Error"
			};
		} finally {
			angular.copy(searchAPIResponse, this);
		}
	};

	aisaSearch.newSearchRequest = function(requestData) {
		return new SearchRequest(requestData);
	};

	aisaSearch.submit = function(searchRequest) {
		var deferred = $q.defer();
		$http(searchRequest).then(
			function(response) {
				deferred.resolve(new SearchResponse(response));
			},
			function(response) {
				deferred.reject(response);
			}
		);
		return deferred.promise;
	};
}]);
