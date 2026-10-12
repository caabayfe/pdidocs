function(spPreference) {	
	var type;

	function save(data, sys_id) {
		var providers = {};
		if (data.length) {
			angular.forEach(data, function(codeBlock, key) {
				providers[codeBlock.name] = codeBlock.show;															
			});
			spPreference.set("wep-" + type + "-" + sys_id, JSON.stringify(providers));
		}
	}

	function load(data, pref) {
		if (data.length) {		
			var providers = JSON.parse(pref || '{}');			
			angular.forEach(data, function(item) {
				item.show = providers[item.name] || false;								
			});		
		}	
	}

	function clear($select, options) {
		var selectize = $select[0].selectize;
		selectize.clear();
		selectize.clearOptions();
		selectize.load(function(callback) {
			callback(options);
		});		
	}

	function link(scope, element) {		
		type = scope.type;			
		var key = 'name';
		var config = {
			valueField: key,
			labelField: key,
			searchField: key,
			options: scope.options,
			allowEmptyOption: true,
			placeholder: scope.label || 'Dependencies',						
			onChange: function(value) {
				angular.forEach(scope.options, function(item) {
					if (item[key] === value) {
						item.show = true;
						scope.$apply();
					}
				})
			}
		};
		
		var $select = $(element).selectize(config);
		
		scope.$on('$sp.wep-' + type, function(e, action, option) {
			if (action === 'close') {
				$select[0].selectize.clear();
				save(scope.options, option);
			}

			if (action === 'save')
				save(scope.options, option);

			if (action === 'load')
				load(scope.options, scope.prefs);
			
			if (action === 'clear') 
				clear($select, scope.options);

		});
		
		load(scope.options, scope.prefs);
		
	}

	return {
		restrict: 'E',
		scope: {
			options: '=',
			prefs: '=',
			label: '=',
			type: '='
		},
		template: '<select class="form-control sp-dep"></select>',
		replace: true,
		link: link
	};

}
