(function() {
	var gAddToAppDialog = {
		addToApp: function () {
			var select = g_document.getElement('#app_picker');
			var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
			ga.addParam('sysparm_function', 'addToApplication');
			ga.addParam('sysparm_sys_id', '$[sysIds]');
			ga.addParam('sysparm_sys_app', select.value);
			ga.addParam('sysparm_sys_table_name', '$[sysTableName]');
			ga.getXML(function (response) {
				GlideDialogWindow.get().destroy();
				g_navigation.reloadWindow();
			});
			return true;
		}
	};

	var dialogContainer = g_document.getElement('#add_code_dialog_container')
	angular.injector(['ng', 'ngSanitize', 'sn.common.controls', 'sn.common.util', 'sn.common.glide', 'sn.common.i18n']).invoke(function($rootScope, $compile, $document) { $compile(dialogContainer)($rootScope); $rootScope.$digest() })

	dialogContainer.addEventListener('click',
			function (evt) {
				var elem = evt.target;
				switch (elem.id) {
					case 'ok_button':
						gAddToAppDialog.addToApp();
						break;
					case 'cancel_button':
						GlideDialogWindow.get().destroy();
				}
			});

	dialogContainer.addEventListener('keyup',
			function (evt) {
				var elem = evt.target;
				switch (evt.keyCode) {
					case 13: // enter
						g_document.getElement('#ok_button').click();
						break;
				}
			}
	);

	var selectList = g_document.getElement('#app_picker');
	if (selectList === null) {
		g_document.getElement('#ok_button').disabled = 'disabled';
		g_document.getElement('#ok_button').style.display = 'none';
	} else {
		g_document.getElement('#ok_button').focus();
	}
})();
