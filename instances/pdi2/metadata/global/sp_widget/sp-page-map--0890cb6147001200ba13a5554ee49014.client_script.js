function($scope, $location, $rootScope) {
	function nodeSelectionChanged(node) {
		var evt = {};
		var d = node.data;
		evt.sys_id = d.sys_id;
		if (evt.sys_id == display_id)  // get called twice by gojs
			return; 

		evt.table = d.sys_class_name || d.table;
		display_id = evt.sys_id;
		$location.search('table', evt.table).search('sys_id', evt.sys_id).search('spa', 1);
		$rootScope.$broadcast('$sp.list.click', evt);
	}
	
  var display_id = $location.search().sys_id;
  $scope.page = {
		displayValue: $scope.data.title,
		value: $scope.data.id,
		name: 'page'
	};
	
	$scope.$on("field.change", function(evt, parms) {
		if (parms.field.name == 'page')
			changePage(parms.newValue);
	});
	
	function changePage(p){
		var path = $location.path();
		var searchParms = $location.search();
		$location.search({id: searchParms.id, p: p});
	}
	
	if ($scope.data.id) {
		var $go = go.GraphObject.make;  // for conciseness in defining templates
		var node_id = "page_map";
		var diagram =
				$go(go.Diagram, node_id, {
					initialAutoScale: go.Diagram.UniformToFill,
					// define the layout for the diagram
					layout: $go(go.TreeLayout, { nodeSpacing: 5, layerSpacing: 30 })
				});

		diagram.model = new go.TreeModel($scope.data.map);
		var font = "13px Helvetica, Arial, sans-serif";

		// Define a simple node template consisting of text followed by an expand/collapse button
		diagram.nodeTemplate = $go(go.Node, "Horizontal",
				{ selectionAdorned: false, selectionChanged: nodeSelectionChanged },  // this event handler is defined below
				$go(go.Panel, "Auto",
					$go(go.Shape, { strokeWidth: 3 }, 
							new go.Binding("stroke", "isSelected", function(s){
								if (s)
									return $scope.options.sp_node_selected_color;
								else
									return null;
							}).ofObject(""),
							new go.Binding("fill", "table", function(t){ 
						switch(t){
							case "sp_widget":
								return $scope.options.sp_widget_color;
							case "sp_instance":
								return $scope.options.sp_instance_color;
							case "sp_page":
								return $scope.options.sp_page_color;
							default:
								return $scope.options.sp_default_color;
						}
					})),
					$go(go.TextBlock, { font: font, margin: 3 },
						new go.Binding("text", "name"),
						new go.Binding("stroke", "table", function(t) { // only widgets, instances, or pages get white text
							return (/(widget)|(instance)|(page)/).test(t) ? "white" : "#2e2e2e";
						}))
				 )
				//$go("TreeExpanderButton") // this was overkill for small diagrams
			 );

		diagram.select(diagram.findNodeForKey(display_id));

		// Define a trivial link template with no arrowhead
		// We don't want to have a black stroke and fill when in windows high contrast mode
		var shapeParam = {};
		if (window.matchMedia('(-ms-high-contrast: active)').matches) {
			shapeParam = { 
				stroke: 'windowText', 
				fill: 'windowText'
			};
		}
		
		diagram.linkTemplate = $go(go.Link, { selectable: false }, $go(go.Shape, shapeParam));  // the link shape
		
		// Resize the graph container height when the graph changes size
		diagram.addDiagramListener('DocumentBoundsChanged', function(){
			var diagramHeight = parseInt(diagram.documentBounds.height);
			jQuery("#" + node_id).height(diagramHeight);
		})
	}
}
