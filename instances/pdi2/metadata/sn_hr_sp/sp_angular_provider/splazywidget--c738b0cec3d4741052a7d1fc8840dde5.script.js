function spLazyWidget(spUtil, $timeout) {
	
	var CACHE = {};
	var MAX_CACHE_ITEMS = 100;
	var SPINNER_DELAY = 300;

	var templateHtml = [
		'<div class="lazywidget" ng-class="{loading: ctrl.loading}">',
		'		<div class="__spinner">',
		'			<i class="fa fa-circle-o-notch fa-2x fa-spin" aria-hidden="true"></i>',
		'		</div>',
		'		<sp-widget widget="ctrl.widgetConfig" ng-if="ctrl.widgetConfig"/>',
		'</div>'
	].join('');
	
	var styles = [
		'.lazywidget > .__spinner {',
		'		text-align:center;',
		'		display: none;',
		'		color:#b7b7b7;',
		'}',
		'.lazywidget.loading > .__spinner {',
		'		display: block;',
		'}'
	].join('');

	function Controller($scope) {
		this.loading = false;
		this.widgetConfig = null;
		this._importWidget(this.name, this.options);
	}

	Controller.prototype = {

		_importWidget: function(widgetName, widgetOptions) {
			var self = this;
			var cachedConfig = this._getCache(widgetName, widgetOptions);
			if (cachedConfig) {
				this._renderWidget(cachedConfig);
				return;
			}
			var timer = $timeout(function() {
				// show spinner only if wait is longer than 300ms
				self.loading = true;
			}, SPINNER_DELAY);
			spUtil.get(widgetName, widgetOptions).then(function(widgetConfig) {
				$timeout.cancel(timer);
				self._renderWidget(widgetConfig);
				self._setCache(widgetName, widgetOptions, widgetConfig);
			});
		},
		
		_renderWidget: function(widgetConfig) {
			this.loading = false;
			this.widgetConfig = widgetConfig;
		},
		
		_setCache: function(widgetName, widgetOptions, widgetConfig) {
			if (Object.keys(CACHE).length > MAX_CACHE_ITEMS) {
				return;
			}
			var cacheKey = this._createCacheKey(widgetName, widgetOptions);
			CACHE[cacheKey] = widgetConfig;
		},

		_getCache: function(widgetName, widgetOptions) {
			var cacheKey = this._createCacheKey(widgetName, widgetOptions);
			return CACHE[cacheKey] || null;
		},

		_createCacheKey: function(widgetName, widgetOptions) {
			widgetOptions = widgetOptions || {};
			var optionTokens = Object.keys(widgetOptions).sort().reduce(function(acc, key) {
				acc.push(key, JSON.stringify(widgetOptions[key]));
				return acc;
			}, []);
			return widgetName + ':' + optionTokens.join(':');
		}
		
	};
	
	function injectStyles() {
		var styleEl = document.createElement('style');
		styleEl.type = 'text/css';
		styleEl.innerHTML = styles;
		document.head.appendChild(styleEl);		
	}

	if(document.readyState === 'complete' || document.readyState === 'interactive') {
		injectStyles();
	} else {
		window.addEventListener("DOMContentLoaded", injectStyles);
	}
	
	return {
		template: templateHtml,
		restrict: 'E',
		controller: Controller,
		scope: {},
		bindToController: {
			name: '<',
			options: '<?'
		},
		controllerAs: 'ctrl'
	};

}
