function($timeout, spUtil) {

	var host = spUtil.getHost();

	function link(scope, element) {

		function render() {
			var defOptions = {				
				container: $(element).find('div')[0],
				textarea: $(element).find('textarea')[0],				
				clientSideStorage: false,
				theme: {
					base: host + '/scripts/thirdparty/epiceditor/themes/base/epiceditor.css',
					preview: host + '/scripts/thirdparty/epiceditor/themes/preview/github.css',
					editor: host + '/scripts/thirdparty/epiceditor/themes/editor/epic-light.css'
				},
				autogrow: true,
				button: false
			};

			scope.editor = new EpicEditor(defOptions).load();						
			scope.editor[scope.field.length ? 'preview' : 'edit']();

			scope.editor.on('update', function(res) {
				$timeout(function() {
					scope.field = res.content;	
				});				
			})

			scope.$on('$destroy', function() {								
				element.remove();				
			})

			scope.$on('$sp.widget-edit-panel-css-transition-end', function() {
				scope.editor.reflow();	
			})

			scope.$on('$sp.widget-edit-panel-toggle-mode', function(e, mode) {			
				scope.editor[mode]();				
			});
		}
		
		var listener = scope.$on('$sp.widget-edit-panel-css-transition-end', function() {
			listener();
			render();			
		});
	}
	return {
		scope: {
			field: '='		
		},
		link: link,
		template: '<div><div class="sp-epiceditor"></div><textarea style="display:none;">{{field}}</textarea></div>',
		replace: true
	}
}
