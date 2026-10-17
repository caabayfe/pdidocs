function($scope, $http, nowServer, $timeout, spUtil, spScUtil, spModal, spAttachmentUpload, i18n, $window, $location, spAriaUtil, nowAttachmentHandler, $log, $sce, $q, spAtf, spSCNavStateManager, cabrillo, $injector) {
	var c = this;
	var sc_request_page = c.options.sc_request_page || 'sc_request';
	$scope.guide_step = 0;
	$scope.m = $scope.data.msgs;
	$scope.evaluatingIncludes = false;
	$scope.data.isMEE = cabrillo.isNative() && $scope.options.native_mobile == 'true';
	$scope.data.isDesktopBrowser = !cabrillo.isNative() && !spUtil.isMobile();
	c.isAgentApp = navigator.userAgent.indexOf('Agent') > -1;
	$scope.isItemOpened = false;
	$scope.setDefaultValue = true;
	includedGformInstances = {};
	var webAnalyticsMsgSuffix = $scope.data.isMEE ? " -NOW Mobile" : "";
    c.hideParentMsg = function() {
        c.data.showParentMsg = false;
    };
	$rootScope.$on('spModel.gForm.rendered', function() {
		if ($scope.guide_step === 0) {
			addCabrilloBottomButtons({
				title: [$scope.data.msgs.nextMsg],
				fn: [$scope.goNext]
			});
		}
		$timeout(function() {
			spAtf.init().then(function(atf) {
				$scope._atf = atf;
				atf.expose('catalog_util', catalogUtil);
			});
		}, 10);
	});

	if ($scope.options.isServiceWorkspace && $window.frameElement) {
		var workspaceParams = {};
		workspaceParams.sysparm_parent_table = $window.frameElement.getAttribute('parent-table') || $window.frameElement.dataParentTable;
		workspaceParams.sysparm_parent_sys_id = $window.frameElement.getAttribute('parent-sys-id') || $window.frameElement.dataParentSysId;
        if (c.options.legacy_catalog == 'true' && workspaceParams.sysparm_parent_table && workspaceParams.sysparm_parent_sys_id) {
            c.server.get({
                action: "get_parent_display_value",
                table: workspaceParams.sysparm_parent_table,
                sys_id: workspaceParams.sysparm_parent_sys_id
            }).then(function(response) {
                if (response.data && response.data.parentObject) {
                    var parentTable = workspaceParams.sysparm_parent_table;
                    var parentSysId = workspaceParams.sysparm_parent_sys_id;
                    var displayValue = response.data.parentObject.parentDisplayValue;
                    var messageTemplate = response.data.parentObject.viewParentMsg;
                    var recordLink = '<a href="/nav_to.do?uri=' + encodeURIComponent('/' + parentTable + '.do?sys_id=' + parentSysId) + '" target="_blank" class="alert-link">' + displayValue + '</a>';
                    var messageHtml = messageTemplate.replace("{link}", recordLink);
                    c.data.viewParentMsg = $sce.trustAsHtml(messageHtml);
                    c.data.showParentMsg = true;
                }
            });
        }

		$scope.data.workspaceParams = workspaceParams;
	}
	if ($scope.data.sc_cat_item) {
		$scope.data.sc_cat_item.trusted_description = $sce.trustAsHtml($scope.data.sc_cat_item.description);
		if ($scope.data.sc_cat_item.request_method == "request")
			$scope.submitButtonMsg = $scope.m.requestMsg;
		else if ($scope.data.sc_cat_item.request_method == "submit")
			$scope.submitButtonMsg = $scope.m.submitMsg;
		else
			$scope.submitButtonMsg = $scope.m.orderNowMsg;
		// Breadcrumbs
		if (!$scope.data.categories)
			$scope.data.categories = [];
		$scope.data.categories.forEach(function(category, index, categories) {
			categories[index].url = category.url + '&catalog_id=' + $scope.data.catalog_id;
		});
		if ($scope.data.categories.length > 0) {
			$scope.data.categories.unshift({
				label: $scope.data.sc_catalog || $scope.page.title,
				url: '?id=' + $scope.data.sc_category_page + '&catalog_id=' + $scope.data.catalog_id
			});
			$scope.data.categories.push({
				label: $scope.data.sc_cat_item.name,
				url: '#'
			});
			if ($scope.data.all_catalog_msg) {
				$scope.data.categories.unshift({
					label: $scope.data.all_catalog_msg,
					url: '?id=' + $scope.data.sc_category_page + "&catalog_id=-1"
				});
			}
		} else {
			$scope.data.categories.push({
				label: $scope.data.sc_cat_item.name,
				url: '#'
			});
		}
		$timeout(function() {
			$scope.$emit('sp.update.breadcrumbs', $scope.data.categories);
		});
		spUtil.setSearchPage('sc');
	} else {
		var notFoundBC = [{
			label: $scope.page.title,
			url: '?id=' + $scope.data.sc_catalog_page
		}];
		$timeout(function() {
			$scope.$emit('sp.update.breadcrumbs', notFoundBC);
		});
		spUtil.setSearchPage('sc');
	}

	function isValidItemGform(g_form) {
		if (g_form.getSysId() === $scope.data.sc_cat_item.sys_id)
			return true;
		if ($scope.includedItems)
			for (var i in $scope.includedItems)
				if ($scope.includedItems[i].sys_id === g_form.getSysId())
					return true;
		return false;
	}

	function setValueInNextDigestCycle(g_form, value, displayValue) {
		$timeout(function() {
			g_form.setValue($scope.data.sc_cat_item.requested_for_variable_name, value, displayValue);
		});
	}

	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		if (!isValidItemGform(gFormInstance))
			return;
		if ($scope.guide_step == 1)
			removeTabList();

		includedGformInstances[gFormInstance.getSysId()] = gFormInstance;
		spSCNavStateManager.register(gFormInstance);
		spSCNavStateManager.isNative($scope.data.isMEE);
		var g_form = includedGformInstances[$scope.data.sc_cat_item.sys_id];
		if ($scope.setDefaultValue && g_form && c.options.requested_for_id && c.options.requested_for_display) {
			$scope.data.requested_for = {
				id: c.options.requested_for_id,
				display_value: c.options.requested_for_display
			};
			if ($scope.data.sc_cat_item.requested_for_variable_name) {
				$scope.setDefaultValue = false;
				setValueInNextDigestCycle(g_form, c.options.requested_for_id, c.options.requested_for_display);
			}
		} else if ($scope.setDefaultValue && $scope.data.workspaceParams && $scope.data.workspaceParams.sysparm_parent_table && $scope.data.workspaceParams.sysparm_parent_sys_id) {
			$scope.server.get({
				action: 'get_requested_for',
				parentParams: $scope.data.workspaceParams
			}).then(function(response) {
				if (response.data.requested_for && g_form) {
					$scope.setDefaultValue = false;
					$scope.data.requested_for = response.data.requested_for;
					setValueInNextDigestCycle(g_form, response.data.requested_for.id, response.data.requested_for.displayValue);
				}
			});
		}
		if (gFormInstance.getSysId() === $scope.data.sc_cat_item.sys_id) {
			gFormInstance.$private.events.on('stateChange', function(previousState, currentState) {
				if (currentState === 'modified' || currentState === 'unmodified')
					$window.postMessage({ msg: 'WIDGET_FORM_DIRTY', dirty: currentState === 'modified' }, $window.location.origin);
			});
		}

		gFormInstance.$private.events.on('submitted', function(event) {
			gFormInstance.$private.processed = true;
			if (gFormInstance.getSysId() == $scope.data.sc_cat_item.sys_id) {
				$scope.$broadcast('$sp.service_catalog.form_submitted', {
					action_name: 'submit'
				});
				$scope.guide_step = 1;
				evalIncludes();
				spSCNavStateManager.unregisterForms(Object.keys(includedGformInstances));
				$scope.itemShown = 0;
			} else
				processChooseOptions();
		});
		if ($scope.data.isMEE) {
			cabrillo.viewLayout.showSpinner();
			cabrillo.viewLayout.setTitle($scope.data.sc_cat_item.name);
			$rootScope.$on('spModel.gForm.showNativeMobileButtons', function() {
				cabrillo.viewLayout.setTitle($scope.data.sc_cat_item.name);
				showCabrilloBottomButtons();
			});
		}
		// Set Title in Workspace
		else if ($scope.options.isServiceWorkspace)
			$window.postMessage({
				msg: 'CATALOG_ITEM_SET_TITLE',
				title: $scope.data.sc_cat_item.name
			}, $location.origin);

		$timeout(function() {
			$rootScope.$emit('spModel.gForm.rendered');
			hideSpinner();
		}, 175);
	});
	$rootScope.$on('spModel.gForm.rendered', function() {
		if ($scope.guide_step == 0)
			spAriaUtil.sendLiveMessage($scope.m.openedOrderGuideMsg);
		else if ($scope.guide_step == 1)
			sendMessageAfterAllItemsAreLoaded();
	});
	$scope.$on('spModel.gForm.destroyed', function(e, sys_id) {
		delete includedGformInstances[sys_id];
	});
	var validationComplete = $rootScope.$on('$sp.service_catalog.form_validation_complete', function() {
		if ($scope.validating) {
			$scope.validating = false;
			if (typeof $scope.triggerPostValidation === 'function')
				$scope.triggerPostValidation();
		}
		$scope.triggerPostValidation = null;
	});
	var favoriteEvent = $rootScope.$on('favorite', function(e, favorite) {
		$scope.showFavorite = favorite.showFavorite;
		$scope.isFavorite = favorite.isFavorite;
	});

	$scope.$on("$destroy", function() {
		spSCNavStateManager.unregisterForms(Object.keys(includedGformInstances));
		favoriteEvent();
	});

	$scope.toggleFavorite = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.$broadcast('toggleFavorite');
	}
	/*************************************************************************************************/
	/********************************       Guide Navigation Start     *******************************/
	/*****#####################################################################################********/
	$scope.goPrev = function() {
		$scope.triggerPostValidation = null; // reset for safe side
		$scope.validating = false;
		if ($scope.submitted)
			return;
		clearCabrilloBottomButtons();
		$scope.includedItems.forEach(function(item) {
			item.isOpen = false;
		})
		$scope.guide_step--;
		if ($scope.guide_step == 0)
			spSCNavStateManager.unregisterForms(Object.keys(includedGformInstances));
		if ($scope.guide_step === 1) {
			addCabrilloBottomButtons({
				title: [$scope.data.msgs.prevMsg, $scope.data.msgs.nextMsg],
				fn: [$scope.goPrev, $scope.goNext]
			});
		}
	}
	$scope.goNext = function(timeout) {
		var gForm;
		if ($scope.guide_step == 0) {
			$scope.$evalAsync(function() {
				gForm = includedGformInstances[$scope.data.sys_id];
				if (!spScUtil.isServerValidationDone($scope.data.sc_cat_item._fields)) {
					$scope.validating = true;
					$scope.triggerPostValidation = $scope.goNext;
				} else if (gForm && !gForm.submit()) {
					timeout = timeout || 2000;
					if ($scope.data.isMEE)
						openItemWithInvalidFields();
					$timeout(function() {
						$scope.$broadcast('$sp.service_catalog.form_submit_failed', {
							action_name: 'submit'
						});
					}, timeout);
				}
			});
		} else if ($scope.guide_step == 1) {
			if ($scope.totalIncluded < 1) {
				spUtil.addErrorMessage($scope.m.alteastOneItemMsg);
				return;
			}
			$scope.$evalAsync(function() {
				for (var j = 0; j < $scope.includedItems.length; j++) {
					if (!spScUtil.isServerValidationDone($scope.includedItems[j]._fields)) {
						$scope.validating = true;
						$scope.triggerPostValidation = $scope.goNext;
						return;
					}
				}

				$scope.itemsIncluded = $scope.includedItems.length;
				$scope.includedItemsCounter = 0;
				$scope.includedItems.forEach(function(item) {
					includedGformInstances[item.sys_id].$private.processed = false;
				});

				for (var i = 0; i < $scope.includedItems.length; i++) {
					if ($scope.includedItems[i].included) {
						$scope.includedItemsCounter++;
						var g_form = includedGformInstances[$scope.includedItems[i].sys_id];
						g_form.$private.processed = false;
						if (g_form && !g_form.submit()) {
							timeout = timeout || 1000;
							$timeout(function(itemCounter) {
								$scope.$broadcast('$sp.service_catalog.form_submit_failed', {
									action_name: 'submit'
								});
								openItemWithInvalidFields(itemCounter);
							}.bind(null, $scope.includedItemsCounter), timeout);
						}
					} else
						$scope.itemsIncluded--;
				}
			});
		}
	}
	$scope.toggleItemState = function(item) {
		if (item.included) {
			angular.element('#item_details_' + item.sys_id).find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').attr('tabindex', -1);
		} else {
			angular.element('#item_details_' + item.sys_id).find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').removeAttr('tabindex');
		}
		$scope.totalIncluded = ($scope.includedItems || []).filter(function(item) {
			return item.included;
		}).length;
		$scope.requested_for_variable_count += getRequestedForVariableCountDiff(item);
	}

	function getRequestedForVariableCountDiff(item) {
		if (!item.has_requested_for_variable)
			return 0;
		return item.included ? -1 : 1;
	}

	function processChooseOptions() {
		var canSubmit = true;
		for (var i = 0; i < $scope.includedItems.length; i++) {
			if ($scope.includedItems[i].included) {
				var gForm = includedGformInstances[$scope.includedItems[i].sys_id];
				if (gForm && !gForm.$private.processed) {
					canSubmit = false;
					break;
				}
			}
		}
		if (canSubmit) {
			evalGuidePrice();
			spSCNavStateManager.unregisterForms(Object.keys(includedGformInstances));
			$scope.$broadcast('$sp.service_catalog.form_submitted', {
				action_name: 'submit'
			});
			$scope.guide_step = 2;
			spAriaUtil.sendLiveMessage($scope.m.orderSummaryOpenedMsg);
			$scope.showAddToCart = $scope.options.show_add_cart_button == 'true' && !$scope.data.sc_cat_item.no_cart && !$scope.isSequencedGuide;
			addCabrilloBottomButtons({
				title: [i18n.getMessage('Add to Cart'), $scope.submitButtonMsg],
				fn: [$scope.triggerAddToCart, $scope.triggerSubmit]
			});
		}
	}

	var sendMessageAfterAllItemsAreLoaded = (function() {
		var formsIncluded = 0;
		return function() {
			formsIncluded++;
			if (formsIncluded == $scope.includedItems.length) {
				spAriaUtil.sendLiveMessage($scope.m.chooseOptionsOpenedMsg);
				formsIncluded = 0;
			}
		}
	})();

	var openItemWithInvalidFields = function(itemCounter) {
		if (itemCounter == $scope.itemsIncluded) {
			var someFormIsInvalid = false;
			for (var i = 0; i < $scope.includedItems.length; i++) {
				if ($scope.includedItems[i].included) {
					var gForm = includedGformInstances[$scope.includedItems[i].sys_id];
					if (!gForm)
						return;
					var fields = gForm.getFieldNames();
					for (var j = 0; j < fields.length; j++) {
						var field = gForm.getField(fields[j]);
						if (field.isInvalid) {
							if ($scope.data.isMEE) {
								$scope.includedItems[i].isOpen = true;
								$scope.showCancel($scope.includedItems[i].sys_id);
							} else
								$scope.includedItems[i].isOpen = true;
							someFormIsInvalid = true;
							break;
						}
					}
					if ($scope.data.isMEE && someFormIsInvalid)
						break;
				}
			}
			if (!$scope.data.isMEE)
				focusInvalidField();
		}
	}

	function focusInvalidField() {
		$timeout(function() {
			for (var i = 0; i < $scope.includedItems.length; i++) {
				if ($scope.includedItems[i].included) {
					var mandatory = $scope.includedItems[i]._mandatory;
					if (mandatory && mandatory.length > 0) {
						var elems = angular.element("[name*='" + mandatory[0].name + "']");
						if (elems && elems.length > 0) //set focus the first element
							elems[0].focus();
						break;
					} else {
						var gForm = includedGformInstances[$scope.includedItems[i].sys_id];
						getInvalidFields(gForm);
						var invalidFields = gForm._invalidFields;
						if (invalidFields && invalidFields.length > 0) {
							var invalid = angular.element("[name*='" + invalidFields[0].name + "']");
							if (invalid && invalid.length > 0) //set focus the first element
								invalid[0].focus();
							break;
						}
					}
				}
			}
		}, 500);
	}

	$scope.closeItemAccordion = function(itemOpened, id) {
		itemOpened.isOpen = false;
		cabrillo.viewLayout.setNavigationBarButtons();
		cabrillo.viewLayout.setTitle($scope.data.sc_cat_item.name);
		addCabrilloBottomButtons({
			title: [$scope.data.msgs.prevMsg, $scope.data.msgs.nextMsg],
			fn: [$scope.goPrev, $scope.goNext]
		});
		if (id)
			angular.element('#accordion-header-' + id).focus();
		$scope.isItemOpened = false;
	}
	$scope.showItem = function(index) {
		if ($scope.itemShown == index)
			$scope.itemShown = -1;
		else
			$scope.itemShown = index;
	}

	$scope.updateQuantity = function(item) {
        spAriaUtil.sendLiveMessage(i18n.format("Updated {i1} quantity to {i2}", {
            i1: item.name,
            i2: item.quantity
        }));
	}

	$scope.showCancel = function(id) {
		var itemOpened, buttons;
		var restElementsSelectors = ".accordion-header-heading, .og-timeline, .timeline-container, #included-items-title, .accordion-toggle";
		if ($scope.data.isMEE) {
			itemOpened = $scope.includedItems.find(function(item) {
				return item.sys_id === id;
			});
			if (!itemOpened.included) {
				//to handle a corner case on iOS where a disabled item is clickable via VO
				return;
			}
			clearCabrilloBottomButtons();
			cabrillo.viewLayout.setNavigationBarButtons();
			cabrillo.viewLayout.hideBackButton();
			cabrillo.viewLayout.setTitle(itemOpened.name);
			buttons = [{
				title: i18n.getMessage('Done'),
				enabled: true
			}];
			cabrillo.viewLayout.setNavigationBarButtons(buttons, function(index) {
				angular.element(restElementsSelectors).removeAttr('aria-hidden');
				$scope.closeItemAccordion(itemOpened, id);
			});
			angular.element(restElementsSelectors).attr('aria-hidden', 'true');
			document.activeElement && document.activeElement.blur();
			$scope.$$postDigest(function() {
				angular.element('#item_details_' + id + '_wrapper').focus();
			});
		}
		$scope.isItemOpened = true;
	}
	$scope.$watch(function(scope) {
		return !!angular.element("#submit").attr('disabled');
	}, function(newValue, oldValue) {
		if (newValue != oldValue && !$scope.data.isMEE) {
			$timeout(function() {
				spAriaUtil.sendLiveMessage(newValue ? $scope.m.nextButtonDisabledMsg : $scope.m.nextButtonEnabledMsg, "polite");
			});
		}
	});
	/********************************************************************************************/
	/********************************     Guide Navigation End    *******************************/
	/*****###############################################################################********/
	/********************************************************************************************/

	/********************************         Attachments         *******************************/
	/*****###############################################################################********/
	function initAttachmentHandlers() {
		var setAttachments;
		var appendError = function(error) {
			spUtil.addErrorMessage(error.msg + error.fileName);
		};
		for (var i = 0; i < $scope.includedItems.length; i++) {
			$scope.includedItems[i].attachmentHandler = new nowAttachmentHandler(setAttachments, appendError);
			$scope.includedItems[i].attachmentHandler.setParams($scope.includedItems[i].targetTable, $scope.includedItems[i].sysparm_item_guid, 1024 * 1024 * $scope.data.maxAttachmentSize);
		}
	}

	$scope.uploadAttachments = function(item, files) {
		spAttachmentUpload.uploadAttachments(item.attachmentHandler, files);
	};

	//Logic borrowed from the spAttachmentButton directive
	var spAttachmentModal = $scope.data.isDesktopBrowser && $injector.get('spAttachmentModal');
	$scope.openAttachmentUploadModal = function(item, ev) {
		var options = {
			fileSelectHandler: function(files) {
				if (files.length)
					$scope.uploadAttachments(item, files, false); // `false` to disable encryption-modal animation
			},
			supportedExtensions: ''
		}
		return spAttachmentModal.open(options);
	}

	$scope.$on('dialog.upload_too_large.show', function(e) {
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});
	$scope.initAttachmentCallbacks = function(itemIndex) {
		$scope.includedItems[itemIndex].attachmentHandler.setAttachments = function(attachments, action) {
			$scope.includedItems[itemIndex].attachments = attachments;
			if (action === "added") {
				spAriaUtil.sendLiveMessage($scope.m.attachmentAddedMsg);
				if ($scope.includedItems[itemIndex].attachments.length > 0)
					$scope.includedItems[itemIndex].attachment_submitted = true;

			}
			if (action === "renamed")
				spAriaUtil.sendLiveMessage($scope.m.renameSuccessMsg);
			if (action === "deleted") {
				spAriaUtil.sendLiveMessage($scope.m.deleteSuccessMsg);
				if ($scope.includedItems[itemIndex].attachments.length == 0)
					$scope.includedItems[itemIndex].attachment_submitted = false;
			}
			$scope.includedItems[itemIndex].attachment_action_in_progress = false;
			spUtil.get($scope, {
				action: "from_attachment"
			});
		};
		$scope.includedItems[itemIndex].confirmDeleteAttachment = function(attachment) {
			spModal.confirm($scope.data.msgs.delete_attachment).then(function() {
				$scope.includedItems[itemIndex].attachmentHandler.deleteAttachment(attachment);
				$scope.includedItems[itemIndex].attachment_action_in_progress = true;
				$scope.setFocusToAttachmentButton();
			});
		}
	}

	function getRecurringPriceDisplay(frequencyMap, frequencySequence) {
		var rec_price_display = [];
		frequencySequence.forEach(function(seq) {
			if (frequencyMap[seq])
				rec_price_display.push(frequencyMap[seq] + " " + seq);
		});
		return rec_price_display;
	}

	/********************************************************************************************/
	/********************************       Attachments  End      *******************************/
	/*****###############################################################################********/
	/********************************************************************************************/

	/********************************        UTIL Functions       *******************************/
	/*****###############################################################################********/
	function evalGuidePrice() {
		$scope.price = 0;
		var frequencyMap = {};
		for (var i = 0; i < $scope.includedItems.length; i++) {
			if ($scope.includedItems[i].included && $scope.includedItems[i].process_price) {
				var qty = parseInt($scope.includedItems[i].quantity);
				var pricing = $scope.includedItems[i]._pricing;
				var effectivePrice = 0;
				var effectiveRecurringPrice = 0;
				if (typeof $scope.includedItems[i].price != "undefined") {
					effectivePrice = $scope.includedItems[i].price;
				}
				if (typeof $scope.includedItems[i].recurring_price != "undefined") {
					effectiveRecurringPrice = $scope.includedItems[i].recurring_price;
				}
				if (effectiveRecurringPrice >= 0 && pricing.rfd) {
					if (frequencyMap[pricing.rfd])
						frequencyMap[pricing.rfd] += effectiveRecurringPrice * qty;
					else
						frequencyMap[pricing.rfd] = effectiveRecurringPrice * qty;
				}
				if (effectivePrice >= 0)
					$scope.price += effectivePrice * qty;
			}
		}
		frequencyMap.price = $scope.price;
		$scope.server.get({
			action: "format_prices",
			prices: frequencyMap
		}).then(function(response) {
			$scope.price_display = response.data.frequencyMap.price;
			$scope.recurring_price_display = getRecurringPriceDisplay(response.data.frequencyMap, response.data.frequencySequence);
		});
	}

	function evalIncludes() {
		// don't allow submit while waiting on included items eval
		$scope.evaluatingIncludes = true;
		$scope.includedItems = [];
		var guideData = getFieldsData($scope.data.sc_cat_item);
		guideData.sysparm_id = $scope.data.sys_id;
		guideData.without_cart = true;
		guideData._fields = $scope.data.sc_cat_item._fields;
		guideData.cascade = $scope.data.sc_cat_item.cascade;
		guideData.has_requested_for_variable = $scope.data.sc_cat_item.has_requested_for_variable;
		if ($scope.data.workspaceParams) {
			guideData.sysparm_parent_sys_id = $scope.data.workspaceParams.sysparm_parent_sys_id;
			guideData.sysparm_parent_table = $scope.data.workspaceParams.sysparm_parent_table;
		}
		$scope.server.get({
			action: "init_guide",
			orderGuideData: guideData,
			options: c.options
		}).then(function(response) {
			if (response.data.error) {
				$scope.guide_step--;
				return;
			}
			var itemGlobalData = response.data.itemGlobalData;
			var includedItems = itemGlobalData.items;
			var massageItemWithGlobalDataFn = getDataTransferFunction(itemGlobalData);
			includedItems.forEach(function(item) {
				item.trusted_description = $sce.trustAsHtml(item.description);
				massageItemWithGlobalDataFn(item);
				var _val = false;
				Object.defineProperty(item, 'isOpen', {
					get: function() {
						return _val;
					},
					set: function(val) {
						_val = val;
						if (val)
							$rootScope.$broadcast('spModel.view.render', item.sys_id);
					}
				});
			});
			$scope.includedItems = includedItems;
			$scope.requested_for_variable_count = response.data.requested_for_variable_count;
			$scope.showIncludeToggle = response.data.showIncludeToggle;
			$scope.isSequencedGuide = response.data.isSequencedGuide;
			initAttachmentHandlers();
			$scope.totalIncluded = $scope.includedItems.length;
			$scope.conflictingCartDomainMsg = response.data.conflictingCartDomainMsg;
			$scope.evaluatingIncludes = false;
			$scope.guide_requested_for = response.data.guide_requested_for;
			$scope.choiceListQuantity = response.data.choiceListQuantity;
			addCabrilloBottomButtons({
				title: [$scope.data.msgs.prevMsg, $scope.data.msgs.nextMsg],
				fn: [$scope.goPrev, $scope.goNext]
			});
		});
	}

	function getDataTransferFunction(itemGlobalData) {
		return (function(item) {
			//populate ui policies
			item.policy = getObjectsArrayFromIdArray(item.policy, itemGlobalData.ui_policies) || [];
			//populate ui scripts
			item.ui_scripts = itemGlobalData.ui_scripts || [];
			//populate client scripts
			if (item.client_script) {
				item.client_script.onLoad = getObjectsArrayFromIdArray(item.client_script.onLoad, itemGlobalData.client_scripts) || [];
				item.client_script.onChange = getObjectsArrayFromIdArray(item.client_script.onChange, itemGlobalData.client_scripts) || [];
				item.client_script.onSubmit = getObjectsArrayFromIdArray(item.client_script.onSubmit, itemGlobalData.client_scripts) || [];
			}
		});
	}

	function getObjectsArrayFromIdArray(idArray, globalObjectHolder) {
		var objectsArray = [];
		for (var i in idArray)
			objectsArray.push(globalObjectHolder[idArray[i]]);
		return objectsArray;
	}

	function getInvalidFields(gForm) {
		gForm._invalidFields = [];
		var fields = gForm.getFieldNames();
		for (var j = 0; j < fields.length; j++) {
			var field = gForm.getField(fields[j]);
			if (field.isInvalid)
				gForm._invalidFields.push(field);
		}
	}

	function getCurrentGForm() {
		if ($scope.guide_step == 0)
			return includedGformInstances[$scope.data.sc_cat_item.sys_id];
		else {
			var openItem = $scope.includedItems.find(function(item) {
				return item.isOpen === true;
			});
			return includedGformInstances[openItem.sys_id];
		}
	}

	function openItemHelper(item, state, defer) {
		for (var i = 0; i < $scope.includedItems.length; i++)
			if ($scope.includedItems[i].sys_id == item) {
				$scope.includedItems[i].included = state == 'true';
				$scope.includedItems[i].isOpen = true;
				$scope._atf.expose('g_form', spAtf.augmentForm(includedGformInstances[item]));
				defer.resolve();
			}
	}

	function getFieldsData(item) {
		var fieldData = {
			"variables": {}
		};
		for (var field in item._fields) {
			var fieldValue = "";
			if (item._fields[field].value != null && typeof item._fields[field].value != "string")
				fieldValue = item._fields[field].value.toString();
			else
				fieldValue = item._fields[field].value;
			fieldData.variables[item._fields[field].name] = fieldValue;
		}
		return fieldData;
	}

	function getGuideItems(cartname) {
		var items = [];
		var item;
		for (var i = 0; i < $scope.includedItems.length; i++) {
			if ($scope.includedItems[i].included) {
				item = getFieldsData($scope.includedItems[i]);
				item.sysparm_id = item.sysparm_active = $scope.includedItems[i].sys_id;
				item.sysparm_quantity = $scope.includedItems[i].quantity;
				item.sysparm_cart_name = cartname;
				item.sysparm_item_guid = $scope.includedItems[i].sysparm_item_guid;
				items.push(item);
			}
		}
		return items;
	}

	/*********************************************************************************************/
	/********************************          UTIL Functions End           **********************/
	/*****################################################################################********/
	/*********************************************************************************************/
	/********************************           Submit Handlers             **********************/
	/*****################################################################################********/
	$scope.triggerAddToCart = function() {
		var webAnalyticsMsgSuffix = $scope.data.isMEE ? " - NOW Mobile" : "";
		clearCabrilloBottomButtons();
		if ($scope.conflictingCartDomainMsg) {
			spUtil.addErrorMessage($scope.conflictingCartDomainMsg);
			return;
		}
		if ($scope.submitted)
			return;
		$scope.server.get({
			action: 'log_request_cart',
			itemDetails: {
				sys_id: $scope.data.sc_cat_item.sys_id,
				name: $scope.data.sc_cat_item.name,
				sys_class_name: $scope.data.sc_cat_item.sys_class_name
			}
		});
		$scope.submitted = true;
		$scope.server.get({
			action: "add_to_cart",
			items: getGuideItems(""),
			sys_id: $scope.data.sys_id,
			guide_requested_for: $scope.guide_requested_for
		}).then(function(response) {
			$rootScope.$broadcast("$sp.service_catalog.cart.add_item");
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
			$scope.$emit("$sp.sc_order_guide.add_to_cart");
			window.GlideWebAnalytics.trackEvent('Service Catalog', 'Catalog Cart' + webAnalyticsMsgSuffix, 'Order Guide Added to Cart', 0, 0);
			if ($scope.data.isMEE) {
				$scope.submitted = true;
				cabrillo.message.showMessage(cabrillo.message.SUCCESS_MESSAGE_STYLE, i18n.getMessage('Items have been added successfully to your cart'));
				$timeout(function() {
					cabrillo.flowControl.flowEnded();
					return;
				}, 200);
				return;
			}
			spModal.open({
				message: i18n.getMessage('Items have been added successfully'),
				size: 'sm',
				backdrop: 'static',
				keyboard: false,
				noDismiss: true,
				buttons: [{
					label: i18n.getMessage('Catalog Home'),
					cancel: true
				},
					{
						label: i18n.getMessage('View Cart'),
						primary: true
					}
				]
			}).then(function() {
				$location.search("id=sc_cart");
			}, function() {
				$location.search("id=sc_home");
			});
		}, function(error) {
			spUtil.addErrorMessage(error);
			return;
		});
	}
	// order / create request
	$scope.triggerSubmit = function() {
		clearCabrilloBottomButtons();
		if ($scope.submitted)
			return;
		$scope.submitted = true;
		var hasItems = $scope.includedItems.filter(function(item) {
			return item.sys_class_name != 'sc_cat_item_producer';
		}).length > 0;
		$scope.showOrderConfirmation = showOrderConfirmation();
		if ($scope.showOrderConfirmation) {
			var requested_for_id = "";
			var requested_for_display = "";
			if ($scope.data.requested_for && $scope.data.requested_for.id && $scope.data.requested_for.displayValue) {
				requested_for_id = $scope.data.requested_for.id;
				requested_for_display = $scope.data.requested_for.displayValue;
			}
			//Required to pass as payload for usage as embeddedWidget
			var embeddedWidgetOptions = {
				"auto_redirect": "true",
				"requested_for_id": requested_for_id,
				"requested_for_display": requested_for_display
			};
			var payload = {
				cart: '' + $scope.data.sys_id,
				itemDetails: {
					items: getGuideItems('' + $scope.data.sys_id),
					request_method: $scope.data.sc_cat_item.request_method,
					sys_id: $scope.data.sc_cat_item.sys_id,
					name: $scope.data.sc_cat_item.name,
					sys_class_name: $scope.data.sc_cat_item.sys_class_name
				},
				workspaceParams: $scope.data.workspaceParams,
				action: "order_guide"
			};
			for (var embeddedOption in embeddedWidgetOptions) {
				payload[embeddedOption] = c.options[embeddedOption] || embeddedWidgetOptions[embeddedOption];
			}
			$scope.server.get(payload).then(function(response) {
				var orderGuideModalCtrl;
				var unregister = $scope.$on('$sp.service_catalog.cart.cancel_order', function() {
					orderGuideModalCtrl.close();
					$scope.submitted = false;
					$timeout(function() {
						addCabrilloBottomButtons({
							title: [i18n.getMessage('Add to Cart'), $scope.submitButtonMsg],
							fn: [$scope.triggerAddToCart, $scope.triggerSubmit]
						});
						$('#submit-btn').focus();
					});
				});
				var closeModalOnSubmit = $scope.$on("$sp.service_catalog.cart.submitted", function() {
					orderGuideModalCtrl.close();
					$scope.submitted = true;
				});
				var orderGuideModal = angular.copy(response.data.orderGuideModal);
				orderGuideModal.options.afterOpen = function(ctrl) {
					orderGuideModalCtrl = ctrl;
				};
				orderGuideModal.options.afterClose = function() {
					unregister();
					closeModalOnSubmit();
					$scope.orderGuideModal = null;
					orderGuideModalCtrl = null;
					var elm = document.getElementsByName("order")[0];
					if (elm)
						elm.focus();
				};
				$scope.orderGuideModal = orderGuideModal;
			});
			return $scope.submitted;
		} else {
			if ($scope.data.isMEE)
				cabrillo.viewLayout.showSpinner();
			$scope.data.action = 'checkout_guide';
			$scope.data.guideItems = getGuideItems('' + $scope.data.sys_id);
			$scope.data.guide_requested_for = $scope.guide_requested_for;
			$scope.server.update().then(function(response) {
				$scope.data.action = undefined;
				$scope.data.guideItems = undefined;
				appendOrderNowOutputParams($scope.data.result);
				$scope.$emit("$sp.sc_order_guide.submitted", $scope.data.result);
				window.GlideWebAnalytics.trackEvent('Service Catalog' + webAnalyticsMsgSuffix, 'Order Guide Request', 'Catalog Request Submitted', $scope.includedItemsCounter, 0);
				$scope.submitted = true;
				hideSpinner();
				if ($scope.options.auto_redirect == 'false') {
					spUtil.addInfoMessage($scope.m.requestSubmitted);
					return;
				} else {
					if ($scope.data.result.request_id) {
						if ($scope.options.isServiceWorkspace && $scope.options.hide_actions)
							$location.search({
								id: sc_request_page,
								is_new_order: true,
								table: 'sc_request',
								sys_id: $scope.data.result.request_id,
								hide_actions: $scope.options.hide_actions
							});
						else
							$location.search({
								id: sc_request_page,
								is_new_order: true,
								table: 'sc_request',
								sys_id: $scope.data.result.request_id
							});
                    } else
						$location.search('id=requests&is_new_order=true');
				}
			}, function(error) {
				hideSpinner();
				spUtil.addErrorMessage(error);
				return;
			});
			return $scope.submitted;
		}
	}

	function showOrderConfirmation() {
		return $scope.data.sys_properties.twostep && $scope.data.sc_cat_item.request_method != "submit" &&
			!$scope.data.sc_cat_item.has_requested_for_variable && $scope.requested_for_variable_count !== $scope.totalIncluded;
	}

	function hideSpinner() {
		if ($scope.data.isMEE)
			cabrillo.viewLayout.hideSpinner();
	}

	$scope.$watch('guide_step', function(newValue, oldValue) {
		if (newValue !== oldValue) {
			$scope.$$postDigest(function() {
				angular.element('#guide-step-' + newValue).focus();
			});
		}
	});

	//If its a two step process, ordernow will return sys_id, number and table. In case of checkout,
	//If the cart has one producer, output would contain sys_id, number and table. But in case of cat items,  sys_id, number, table
	//would be empty.
	//Making the output consitent between the above three cases.
	function appendOrderNowOutputParams(output) {
		output.sys_id = output.sys_id || output.request_id;
		output.number = output.number || output.request_number;
		output.table = output.table || 'sc_request';
	}

	/*********************************************************************************************/
	/********************************        Submit Handlers End           ***********************/
	/*****################################################################################********/
	var catalogUtil = {
		updateGform: function() {
			var g_form = getCurrentGForm();
			if (g_form)
				$scope._atf.expose('g_form', spAtf.augmentForm(g_form));
		},
		addRow: function(fieldId, timeoutInMS) {
			var deferred = $q.defer();
			var g_form = getCurrentGForm();
			if (g_form) {
				if (timeoutInMS <= 0)
					timeoutInMS = 1000;
				$scope.$broadcast("$sp.sc_multi_row.create_row", fieldId, g_form.getSysId());
				$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
					if (gFormInstance.getSysId() == fieldId)
						deferred.resolve();
				});
				$timeout(function() {
					deferred.reject();
				}, timeoutInMS);
			} else
				deferred.reject();
			return deferred.promise;
		},
		navigateToStep: function(num, timeout) {
			var defer = $q.defer();
			var step = parseInt(num) - 1;
			if (Math.abs(step - $scope.guide_step) != 1) {
				defer.reject("Can't navigate to next step");
				return defer.promise;
			}
			if (step > $scope.guide_step)
				$scope.goNext(timeout);
			else {
				$scope.goPrev();
				defer.resolve();
			}
			var cleanup = $scope.$on('$sp.service_catalog.form_submit_failed', function() {
				cleanup();
				defer.reject("Can't navigate to next step");
			});
			var cleanup1 = $scope.$on('$sp.service_catalog.form_submitted', function() {
				cleanup1();
				defer.resolve("Can navigate to next step");
			});
			return defer.promise;
		},
		validateIncludedList: function(list, stage) {
			var items = list.split(',').reduce(function(obj, item) {
				obj[item] = false;
				return obj;
			}, {});
			var included = stage == 1 ? $scope.includedItems : $scope.includedItems.filter(function(item) {
				return item.included == true;
			});
			if (Object.keys(items).length != included.length)
				return false;
			for (var i = 0; i < included.length; i++)
				if (!items.hasOwnProperty(included[i].sys_id))
					return false;
			return true;
		},
		openItem: function(item, state, timeoutInMS) {
			if (timeoutInMS <= 0)
				timeoutInMS = 10000;
			var defer = $q.defer();
			if (includedGformInstances[item]) {
				openItemHelper(item, state, defer);
			}
			$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
				if (gFormInstance.getSysId() == item) {
					openItemHelper(item, state, defer);
				}
			});
			$timeout(function() {
				defer.reject();
			}, timeoutInMS);
			return defer.promise;
		},
		getPrice: function() {
			var res = {};
			var item = $scope.includedItems.find(function(itemData) {
				return itemData.isOpen == true;
			});
			if (item) {
				res.price = item.price;
				res.recurring_price = item.recurring_price;
				res.recurring_frequency = item.recurring_frequency;
			}
			return res;
		},
		getGuidePrice: function() {
			return $scope.price_display;
		},
		addToCart: function() {
			var defer = $q.defer();
			if ($scope.guide_step == 2)
				$scope.triggerAddToCart();
			if (!$scope.submitted)
				defer.reject("Can't submit form.");
			else
				defer.resolve();
			return defer.promise;
		},
		submitOrderGuide: function() {
			var defer = $q.defer();
			if ($scope.guide_step == 2 && $scope.triggerSubmit()) {
				if ($scope.showOrderConfirmation)
					defer.resolve();
				else {
					var cleanUp = $scope.$on('$sp.sc_order_guide.submitted', function(o, result) {
						$timeout(function() {
							cleanUp();
							result.single_step = true;
							defer.resolve(result);
						}, 10);
					});
				}
			} else
				defer.reject();
			return defer.promise;
		}
	};
	/********************************************************************************************/
	/********************************                ATF End            *************************/
	/*****###############################################################################********/
	/********************************************************************************************/

	/********************************            Cabrillo Start         *************************/
	/*****###############################################################################********/
	function clearCabrilloBottomButtons() {
		if ($scope.data.isMEE) {
			cabrillo.viewLayout.setBottomButtons();
		}
	}

	function showCabrilloBottomButtons() {
		if (!$scope.data.isMEE) return;
		if ($scope.guide_step === 0) {
			addCabrilloBottomButtons({
				title: [$scope.data.msgs.nextMsg],
				fn: [$scope.goNext]
			});
		}
		if ($scope.guide_step === 1) {
			var itemOpened = $scope.includedItems.find(function(item) {
				return item.isOpen;
			});
			if (itemOpened) {
				$scope.showCancel(itemOpened.sys_id);
			}
		}
	}

	function addCabrilloBottomButtons(buttonDetails) {
		if ($scope.data.isMEE) {
			var buttons = [];
			clearCabrilloBottomButtons();
			switch ($scope.guide_step) {
				case 0:
					buttons = [{
						title: buttonDetails.title[0],
						enabled: true,
						backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
						textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
					}];
					cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
						buttonDetails.fn[buttonIndex]();
					});
					cabrillo.viewLayout.showBackButton();
					break;
				case 1:
					buttons = [{
						title: buttonDetails.title[0],
						enabled: true,
						backgroundColor: '#f7f7f7',
						textColor: '#000000'
					},
						{
							title: buttonDetails.title[1],
							enabled: true,
							backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
							textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
						}
					];
					cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
						//Disable next button in choose option if all the items are marked as not included: This will be taken care in goNext function
						// however the previous button should still work
						if (!($scope.submitted) || buttonIndex === 0) {
							buttonDetails.fn[buttonIndex]();
						}
					});
					cabrillo.viewLayout.hideBackButton();
					break;
				case 2:
					// Displaying 'Edit' icon on top right corner
					buttons = [{
						title: i18n.getMessage('Edit'),
						enabled: true
					}];
					cabrillo.viewLayout.setNavigationBarButtons(buttons, function(index) {
						cabrillo.viewLayout.setNavigationBarButtons();
						$scope.goPrev();
					});
					if ($scope.data.sys_properties.cartEnabled && $scope.showAddToCart) {
						buttons = [{
							title: buttonDetails.title[0],
							enabled: true,
							backgroundColor: '#f7f7f7',
							textColor: '#000000'
						},
							{
								title: buttonDetails.title[1],
								enabled: true,
								backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
								textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
							}
						];
						cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
							buttonDetails.fn[buttonIndex]();
						});
					} else {
						buttons = [{
							title: buttonDetails.title[1],
							enabled: true,
							backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
							textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
						}];
						cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
							buttonDetails.fn[1]();
						});
					}
					cabrillo.viewLayout.hideBackButton();
					break;
			}
		}
	}

	function removeTabList() {
		var accordion = document.getElementById('id-accordion');
		if (accordion && accordion.children && accordion.children[0])
			accordion.children[0].setAttribute('role', '');
	}

	var mespOpenPopupUnregister = $rootScope.$on("mesp.popup.open", function() {
		// Timeout is to give a better user experience otherwise when this popup opens,
		// the cabrillo buttons will be displayed immediately giving a bad user experience.
		$timeout(function() {
			clearCabrilloBottomButtons();
		});
	});
	var mespClosePopupUnregister = $rootScope.$on("mesp.popup.close", function() {
		//Do not display cabrillo buttons when there is an active mrvs row as it will have it's own buttons.
		var activeRowElement = document.getElementById("mrvs_active_row");
		if (!!activeRowElement)
			return;

		// Timeout is to give a better user experience otherwise when this popup opens,
		// the cabrillo buttons will be displayed immediately giving a bad user experience.
		$timeout(function() {
			showCabrilloBottomButtons();
		});
	});

	$window.onpageshow = function() {
		if (c.isNative)
			$scope.$emit('spModel.gForm.showNativeMobileButtons');
	};
	/**********************************************************************************************/
	/********************************            Cabrillo End           ****************************/
	/*****##################################################################################********/
}
