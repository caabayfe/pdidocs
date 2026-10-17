/* eslint-disable no-console */
angular.module("relatedListDiagnostics", []).controller('rl_diagnostics_controller', function($scope, $http) {
	$scope.relatedLists = [];
	$scope.showResultsVal = false;
	$scope.isLoading = false;

	$scope.requestDiagnostics = () => {
		const targetTable = $scope.getTargetTable();
		const targetSysId = $scope.getTargetSysId();
		const viewName = $scope.getViewName();
		const relationshipId = $scope.getRelationshipId();

		if (!targetTable || !targetSysId) {
			console.log('Cannot make request with a target record being set');
			return;
		}

		$scope.isLoading = true;
		$scope.showResultsVal = false;
		const baseUrl = '/api/now/ui/related_list_diagnostics?target_table=' + targetTable + '$[AMP]target_sys_id=' + targetSysId;

		const url = (relationshipId) ?
			baseUrl + '$[AMP]relationship_sys_id=' + relationshipId :
			baseUrl + '$[AMP]view_id=' + viewName;

		$http({
			method: 'GET',
			url,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-UserToken': g_ck
			}
		}).then(function(response) {
			$scope.isLoading = false;
			if (response.status === 200 && response?.data?.result) {
				$scope.showResultsVal = true;
				$scope.relatedLists = $scope.sortResults($scope.filterInvalidResults(response.data.result));
				$scope.invalidRelatedLists = $scope.getInvalidResults(response.data.result);
				$scope.totalQueryTime = $scope.sumMetric($scope.relatedLists, 'queryTime');
				$scope.totalRelationshipEvalTime = $scope.sumMetric($scope.relatedLists, 'relationshipEvalTime');
				$scope.totalRelationshipSqlTime = $scope.sumMetric($scope.relatedLists, 'relationshipEvalSqlTime');
			}
		}).catch(function(err) {
			$scope.isLoading = false;
			console.log('Error fetching diagnostics: ' + err);
		});
	};

	$scope.reloadWithTable = () => {
		const targetTable = $scope.getTargetTable();
		g_navigation.open('/related_list_diagnostics.do?sysparm_table=' + targetTable, '_self');

	};

	$scope.filterInvalidResults = (relatedLists) => {
		return relatedLists.filter((rl) => rl.relatedListMetrics);
	};

	$scope.getInvalidResults = (relatedLists) => {
		return relatedLists.filter((rl) => !rl.relatedListMetrics);
	};

	$scope.sortResults = (relatedLists) => {
		return relatedLists.sort((rl1, rl2) =>
			(rl2.relatedListMetrics.queryTime + rl2.relatedListMetrics.relationshipEvalTime) -
			(rl1.relatedListMetrics.queryTime + rl1.relatedListMetrics.relationshipEvalTime)
		);
	};

	$scope.sumMetric = (relatedLists, propName) => {
		return relatedLists.reduce( function(sum, rl) {
			return sum + rl.relatedListMetrics[propName];
		}, 0);
	};

	$scope.getViewName = () => {
		const viewElement = document.getElementById('view_choice_list');
		return (viewElement) ? viewElement.value : '';
	};

	$scope.getTargetTable = () => {
		const targetRecordTableElem = document.getElementById('target_recordTABLE');
		if (targetRecordTableElem)
			return targetRecordTableElem.value;

		const targetRecordElem = document.getElementById('target_table');
		if (targetRecordElem)
			return targetRecordElem.value;

		return '';
	};

	$scope.getTargetSysId = () => {
		const targetSysId = document.getElementById('target_record');
		return targetSysId ? targetSysId.value: '';
	};

	$scope.getRelationshipId = () => {
		const relationshipId = document.getElementById('relationship_id');
		return (relationshipId) ? relationshipId.value : '';
	};

	$scope.showResults = () => {
		return $scope.showResultsVal;
	};

	$scope.getRelatedLists = () => {
		return $scope.relatedLists;
	};

	$scope.isRelationship = (rl) => {
		return rl.value && rl.value.startsWith('REL:');
	};

	$scope.getRelationshipUrl = (rl) => {
		if (!$scope.isRelationship(rl))
			return '';

		const sysId = rl.value.substring(4);
		return 'sys_relationship.do?sys_id=' + sysId;
	};

	$scope.getRelationshipEvalTime = (rl) => {
		return $scope.isRelationship(rl) ? rl.relatedListMetrics.relationshipEvalTime : '';
	};

	$scope.getRelationshipSqlTime = (rl) => {
		return $scope.isRelationship(rl) ? rl.relatedListMetrics.relationshipEvalSqlTime : '';
	};

	$scope.getRelationshipEvalQueryCount = (rl) => {
		return $scope.isRelationship(rl) ? rl.relatedListMetrics.relationshipEvalQueryCount : '';
	};

	$scope.getFieldsInIndex = (rl) => {
		if (!rl.relatedListExplain)
			return '';

		const { fieldsInIndex } = rl.relatedListExplain;
		return (fieldsInIndex && Array.isArray(fieldsInIndex)) ? fieldsInIndex.join(',') : '';
	};

	$scope.getSqlStatement = (rl) => {
		if (!rl.relatedListExplain)
			return '';

		const { selectStatement } = rl.relatedListExplain;
		return selectStatement ? selectStatement : '';
	};

	$scope.copySqlStatement = (event) => {
		const sqlText = event.target.getAttribute('data-original-title');
		navigator.clipboard.writeText(sqlText);
		return false;
	};

	$scope.getListHref = (rl) => {
		const { targetTable, filter } = rl;
		return '/' + targetTable + '_list.do?sysparm_query=' + filter;
	};

	$scope.getIndexUsed = (rl) => {
		if (!rl.relatedListExplain)
			return '';

		const { indexUsed } = rl.relatedListExplain;
		if (indexUsed === 'none')
			return "-- ${gs.getMessage('none')} --";

		return indexUsed;
	};
});
