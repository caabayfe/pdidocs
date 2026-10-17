(function($j) {

		var ENTER = 13, SPACE = 32, ESC = 27, F7 = 118, LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, TAB = 9;

		$j(document).ready(function() {
			$j('#load_element').focus();
		});

		$j(document.body).focus(function() {
			$j('#load_element').focus();
		});
		$j(document).on("keydown", function(e) {
			if(e.keyCode != ESC)
				return;
			GlideUI.get().clearOutputMessages();
		})

		$j(document).on('modalframe-loaded', function(e, frame) {
			var doc = frame.contentDocument || frame.contentWindow.document;
				if(!doc)
					return;
				$j(doc).on('keydown', function(e) {
					if(e.keyCode != ESC)
						return;
					$j(document).trigger('close-form-modal');
					
				});
		});

		$j(document).on('click', '[data-a11y-target-after-click]', function(event) {
			var target = $j(event.target).attr('data-a11y-target-after-click');
			setTimeout(function() {
					var targetEl = $j('#' + target).get(0);
					if(targetEl)
						targetEl.focus();
			});
		});

		angular.module('sn.mim.bench').directive('snTabsBasicKeyboard', function($window, $document, $timeout) {
			return {
				restrict: 'CA',
				scope: false,
				link: function(scope, el, attr) {
					var isVerticalTabs = attr.verticalTabs == 'true';
					var left = LEFT, right = RIGHT;
					if(isVerticalTabs) {
						left = UP;
						right = DOWN;
					}

					var $timeoutPromise;
					var scopeId = scope.$id;

					scope.$on('destroy', function() {
						$j(el).off('keydown.' + scopeId);
						$j(el).off('click.' + scopeId);
					});

					function modifyTabAttr(current) {
						var children = $(el).children();
						for(var i=0; i<children.length; i++) {
							$j(children[i]).attr('tabindex', '-1');
							$j(children[i]).attr('aria-selected', 'false');
						}
						$j(current).attr('tabindex', '0');
						$j(current).attr('aria-selected', 'true');
					}
					$j(el).on('click.' + scopeId, ".tab", function(event) {
						modifyTabAttr(this);
					});

					$j(el).on('keydown.' + scopeId, ".tab", function(event){
						initWaitTime = undefined;
						if(!(event.keyCode == left || event.keyCode == right))
							return;
						var target = this;
						var tabIndex = $j(this).attr('tabindex');
						if(tabIndex !== "0")
							target = $j(el).find('.tab[tabindex="0"]').get(0) || this;
						
						var children = $j(el).children();
						var index = children.index(target);
						var targetIndex = 0;
						if(event.keyCode == right)
							targetIndex = index + 1;
						else
							targetIndex = index - 1;

						if(targetIndex < 0)
							targetIndex = children.length - 1;
						if(targetIndex >= children.length)
							targetIndex = 0;
						children[targetIndex].click();
						modifyTabAttr(children[targetIndex]);
						children[targetIndex].focus();
					});
				}
			};
		});

	})(jQuery);
