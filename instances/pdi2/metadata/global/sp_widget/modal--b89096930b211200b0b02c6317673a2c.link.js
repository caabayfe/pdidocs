function(scope, element, attrs, ctrl){
	if (!scope.data)
		return;
	var $rootScope = $injector.get('$rootScope');
	var $uibModal = $injector.get('$uibModal');
	var $uibModalStack = $injector.get('$uibModalStack');
	var pageRoot = angular.element('.sp-page-root');

	var opts = {
		size : scope.options.size || 'lg',
		scope: $rootScope.$new(false, scope),
		template : element,
		backdrop: scope.options.backdrop || true,
		keyboard: scope.options.keyboard != undefined ? scope.options.keyboard : true,
		controller : function($scope, $uibModalInstance){
			$scope.instance = scope.data.instance;
			$scope.$on('modal.closing', function() {
				pageRoot.attr('aria-hidden', 'false');
			});
		}
	};

	var label = scope.options.modalLabel || scope.data.instance.name;
	var labelledby = scope.options.modalLabelledby;
	var widgetId = scope.widget.sys_id;

	if (scope.options.modalBodyClass)
		element.addClass(scope.options.modalBodyClass);

	if (scope.options.beforeRender)
		scope.options.beforeRender.call(null, scope.data.instance.data);

	var modalInstance = $uibModal.open(opts);

	if (scope.options.afterOpen)
		scope.options.afterOpen.call(null, modalController(modalInstance));

	if (scope.options.afterClose)
		modalInstance.closed.then(scope.options.afterClose);

	modalInstance.closed.then(function(){
		scope.$emit('sp.widget-modal.closed');
	});

	function setModalAriaLabel(label) {
		var modalObj = $uibModalStack.getTop();
		var modal = modalObj.value.modalDomEl;
		modal.attr('aria-label', label);
		scope.modalLabel = label;
	}
	function setModalAriaAttrs() {
		var modalObj = $uibModalStack.getTop();
		var modal = modalObj.value.modalDomEl;
		if (labelledby)
			modal.attr('aria-labelledby', labelledby);

		modal.attr('aria-modal', 'true');
	}

	modalInstance.rendered.then(function() {
		if (!scope.modalLabel)
			setModalAriaLabel(label);

		setModalAriaAttrs();
		pageRoot.attr('aria-hidden', 'true');
	});
	scope.$on('sp.widget-modal.set-aria-label', function(evt, label) {
		setModalAriaLabel(label);
	});

	scope.$on('sp.widget-modal.clear-focus-cache', function(evt) {
		$uibModalStack.clearFocusListCache();
	});

	function modalController(instance){
		return {
			close: function(){
				instance.close();
			}
		};
	}

}
