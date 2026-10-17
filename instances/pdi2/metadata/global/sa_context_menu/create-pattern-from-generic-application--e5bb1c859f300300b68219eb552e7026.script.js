if (angular.isDefined(item.cid)){
	var saTopologyMapConstants =  $injector.get('saTopologyMapConstants');
	sncEventScope.broadcast(saTopologyMapConstants.EVT_TOPOLOGY_MAP_OPEN_CREATE_PATTERN_FROM_GENERIC_CI , item );
}

 
