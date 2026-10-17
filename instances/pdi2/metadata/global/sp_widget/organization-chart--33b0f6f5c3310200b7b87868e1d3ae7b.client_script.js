function ($scope, $location, $http, spUtil, $timeout) {

	var c = this;
	var $ = go.GraphObject.make;
	var fieldObj = {
		name: {row: 0, column: 0, columnSpan: 2, font: 'bold 9pt sans-serif', alignment: '{go.Spot.Top}',  maxSize: '{new go.Size(160, NaN)}'},
		title: {row: 1, column: 0, columnSpan: 2, font: '8pt sans-serif'},
		department: {row: 2, column: 0, columnSpan: 2, font: '8pt sans-serif'},
		email: {row: 3, column: 0, columnSpan: 2, font: '8pt sans-serif'},
		phone: {row: 4, column: 0, columnSpan: 2, font: '8pt sans-serif'},
		location: {row: 5, column: 0, columnSpan: 2, font: '8pt sans-serif'}
	};

	c.user = {
		displayValue: $scope.data.name,
		value: $scope.data.start,
		name: 'user'
	};

	// base user changed, reload page
	$scope.$on("field.change", function(evt, parms) {
		if (parms.field.name != 'user')
			return;

		var s = $location.search();
		s.p = parms.newValue;
		$location.search(s);
	});


	$timeout(function() {
		c.diagram = $(go.Diagram, 'org_chart', {
			mouseWheelBehavior: go.ToolManager.WheelZoom,
			layout: $(go.TreeLayout, evalGoCode(c.options.tree_layout)) // use a TreeLayout to position all of the nodes
		});

		makeTemplate(c.diagram);

		// create the Model with data for the tree, and assign to the Diagram
		c.diagram.model = $(go.TreeModel, {
			nodeParentKeyProperty: "manager", // this property refers to the parent node data
			nodeDataArray: $scope.data.nodes
		});

	});

	c.zoomIn = function() {
		c.diagram.commandHandler.increaseZoom()
	}

	c.zoomOut = function() {
		c.diagram.commandHandler.decreaseZoom()
	}

	// When a Node is double clicked, open the user record for the person in a new window
	function nodeClick(event, node) {
		window.open(spUtil.format($scope.options.url, {sys_id: node.data.key, page: c.options.page}));
	}

	function makeTemplate(diagram) {
		diagram.nodeTemplate =  $(go.Node, "Auto", angular.extend({click: nodeClick}, evalGoCode(c.options.node_layout)),
			$(go.Shape, "Rectangle", new go.Binding("fill", "color")), // the outer shape for the node, surrounding the Table
			$(go.Panel, "Horizontal",$(go.Picture, evalGoCode(c.options.picture_layout), new go.Binding("source", "photo")), panel()));
		diagram.linkTemplate = $(go.Link, go.Link.Orthogonal,{ selectable: false }, $(go.Shape, evalGoCode(c.options.line) )); // the default black link shape
	}

	function evalGoCode(item) {
		for (var x in item) {
			var re = /{([^}]+)?}/g, match;
			while (match = new RegExp(re).exec(item[x])) {
				item[x] = eval(match[1])
			}
		}

		return item;
	}

	function panel() {
		var fieldName;
		var opts = [
			go.Panel, "Table", evalGoCode(c.options.table_layout),
			$(go.RowColumnDefinition, evalGoCode(c.options.row_layout))];
		var item;
		if (typeof c.options.card_fields === "object" && c.options.card_fields !== null) {
			for (fieldName in c.options.card_fields) {
				item = c.options.card_fields[fieldName];
				appendToOpts(opts, fieldName, item);
			}
		} else {
			var fieldNames = c.options.card_fields && c.options.card_fields.split(",").map(function(f) { return f.trim() });
			var i = 0, len = fieldNames.length;
			var checkAllKeys = fieldNames.some(function (j) {
  				return fieldObj.hasOwnProperty(j);
			});
		
			if (!checkAllKeys) {				
				for (fieldName in fieldObj) {
					item = fieldObj[fieldName];
					appendToOpts(opts, fieldName, item);
				}
			} else {
				for (i = 0; i < len; i++) {
					fieldName = fieldNames[i];
					item = fieldObj[fieldName];
					if (item) {
						appendToOpts(opts, fieldName, item);
					}
				}
			}
		}
		return $.apply(null, opts);
	}
	
	function appendToOpts(opts, fieldName, item) {
		evalGoCode(item);
		opts.push($(go.TextBlock, item, new go.Binding("text", fieldName)));
	}

}
