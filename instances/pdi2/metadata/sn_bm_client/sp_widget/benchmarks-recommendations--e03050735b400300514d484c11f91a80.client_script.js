function($scope, $sce, spModal, $rootScope, $uibModal, spUtil, glideFormFactory, i18n, $uibModalStack, $timeout) {
  /* widget controller */
  var c = this;
document.documentElement.setAttribute('data-useragent', navigator.userAgent);
  c.KEYS = {TAB: 9, LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40};
  c.RECO_TABLE = 'sn_bm_client_recommendation';

  var sortRecos = function(recos) {
    var implList = recos.idList.filter(function(id) {return recos.idMap[id].state === c.states.implemented});
    var otherList = recos.idList.filter(function(id) {return recos.idMap[id].state != c.states.implemented});
    implList.sort(function(a, b) {
      return recos.idMap[b].implementedDateNumeric - recos.idMap[a].implementedDateNumeric;
    });
    otherList.sort(function(a, b) {
      return recos.idMap[b].weightedScore - recos.idMap[a].weightedScore;
    });

    recos.idList = otherList.concat(implList);
  };

  c.sort = function() {
    sortRecos(c.data.recommendations);
  };

  var init = function () {
    c.states = {
      all: 'all',
      none: 'none',
      accepted: 'accepted',
      rejected: 'rejected',
      implemented: 'implemented'
    };
	c.tabs = ['all', 'implemented', 'accepted'];
    c.tab = c.states.all;
    c.counts = c.data.recommendations.counts;
    c.sort();

    // Broadcast the selected tab so that trends can be updated
    $scope.$watch('c.tab', function() {
      var showImplemented = (c.tab === c.states.implemented);
      var data = {
		activeTab: c.tab,
        showImplemented: showImplemented,
        recommendations: showImplemented ? getImplemented(c.data.recommendations) : []
      };
      updateCurrentLimit();

      $rootScope.$broadcast('recommendations.tab', data);
    });
  };
  init();

	c.endOfPageCheck = function() {
		var homeLink = $('li>span>a')[0];
		if(homeLink.text === "Home")
			homeLink.focus();
	};

  c.trustAsHtml = function(html) {
    return $sce.trustAsHtml(html);
  };

  c.recoFilter = function(id) {
    var state = c.data.recommendations.idMap[id].state;
    return (state != c.states.rejected)
        && ((c.tab === c.states.all && state != c.states.implemented)
          || c.tab === state);
  };

  /* Helper functions */
  var updateCurrentLimit = function() {
    c.options.showLimits.current = c.options.showLimits[c.tab];
  };

  var setTabLimit = function(tab, limit) {
    c.options.showLimits[tab] = limit;
    updateCurrentLimit();
  };

  var getImplemented = function(recos) {
    return recos.idList.filter(function(id) {
      return recos.idMap[id].state == c.states.implemented;
    }).map(function(id) {
      return recos.idMap[id];
    });
  };

  var updateCount = function(state, delta) {
    if(state === c.states.all || state === c.states.accepted || state === c.states.implemented) {
       c.counts[state] += delta;
       if(c.counts[state] <= c.options.maxResults)
        setTabLimit(state, c.counts[state]);
    }
  };

  /* View handler functions */
  c.canShowMore = function(tab) {
    return c.options.showLimits.current < c.counts[tab];
  };

  /* Click handlers */
  c.getStarted = function() {
  };

  c.showMore = function(tab, event) {
    setTabLimit(tab, c.counts[tab]);
    c.moveFocus(event);
  };

  c.showLess = function(tab, event) {
    setTabLimit(tab, Math.min(c.counts[tab], c.options.maxResults));
    c.moveFocus(event);
  };

  c.markAsImplemented = function(id, implementedState, event) {
    spModal.confirm(c.data.messages.implementAcknowledgement).then(function() {
      c.updateState(id, implementedState, event);
    });
  };

  c.remove = function(id, event) {
    spModal.confirm(c.data.messages.confirmReject).then(function() {
      c.updateState(id, c.states.rejected, event);
    });
  };

  c.focusActiveTab = function() {
	$('#tab-' + c.tab).focus();
	$('#tab-' + c.tab + ' > a').focus();

	c.recommendationTabPanelAttributes();
  };

	c.recommendationTabPanelAttributes = function () {
		var selectedTab = "tab-"+c.tab;
		c.tabs.forEach(function(elem) {
			if ("tab-" + elem === selectedTab){
				$("#"+ selectedTab ).attr('aria-selected','true');
				$("#"+ selectedTab ).attr('tabindex','0');
			} else {
				$("#tab-" + elem).attr('aria-selected','false');
				$("#tab-" + elem ).attr('tabindex', '-1');
			}
		});
	};

  c.switchTab = function(event, index) {
	var key = null;
	if (event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP ||
		event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN ) {
		key = event.keyCode;
	}
	else if (event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN) {
		key = event.keyCode === c.KEYS.RIGHT;
	}
	else if (event.keyCode === c.KEYS.TAB) {
		if(event.shiftKey) {
			$('#chart-container').focus();
		}
		else {
			var element= $('button[id^="close-"][disabled!="disabled"]');
			if (element.length > 0)
				$("#"+element[0].id).focus();
			else
				$('#chart-container').focus();
			event.preventDefault();
			return;
		}
		event.preventDefault();
	}

	if(key == null)
		return;

	if ( event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP ) {
		c.tab =  ((index - 1) < 0) ? c.tabs[c.tabs.length - 1] : c.tabs[index - 1];
	} else if( event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN ){
		c.tab =  ((index + 1) > c.tabs.length - 1) ? c.tabs[0] : c.tabs[index + 1];
	}
	c.focusActiveTab();
	event.preventDefault();

  };

  c.focusTabs = function(event, index){
	  if (event.keyCode === c.KEYS.TAB && event.shiftKey && index == 0) {
		  if(event.target.id && "get-started-0" === event.target.id) {
			  $("close-0").focus();
		  } else {
			  c.focusActiveTab();
			  event.preventDefault();
		  }
	  }
  };

c.manageRecommendationFocus = function(eventElement, maxListSize) {
	var indexSelected = eventElement.split('-')[eventElement.split('-').length-1];
	var recommendationCount = $('button[id^="close-"]').length;

	if ( recommendationCount === 0 )
		$('#tab-all').focus();
	else if ( recommendationCount === 1 )
		$('#close-0').focus();
	else {
		var newFocusId ="";
		var newIndex = (( recommendationCount - 1 ) > indexSelected) ? indexSelected : (indexSelected-1);
		if(eventElement === "show-more"  )
			newFocusId = "close-" + maxListSize;
		else if (eventElement === "show-less" )
			newFocusId = "close-" + (recommendationCount-1);
		else
			newFocusId = "close-" + newIndex;
		$("#"+newFocusId).focus();
	}
}


  c.updateState = function(id, state, event) {

    c.server.get({reco_id: id, state: state, action: 'update_state'}).then(function (r) {
      if (!r.data.success || !r.data.activity)
        return;

	/* Decrease old state count and increase new state count */
      var reco = c.data.recommendations.idMap[id];
      if(reco.state === c.states.none) {
        if(state !== c.states.accepted)
          updateCount(c.states.all, -1);
      }
      else if(reco.state === c.states.accepted) {
        updateCount(c.states.accepted, -1);
        updateCount(c.states.all, -1);
      }
      updateCount(state, 1);
      reco.state = state;

	/* Update the activity dates */
      reco.actionDate = r.data.activity.actionDate;
      reco.savedDisplay = r.data.activity.savedDisplay;
      reco.implementedDisplay = r.data.activity.implementedDisplay;
      reco.implementedDateNumeric = r.data.activity.implementedDateNumeric;
      c.moveFocus(event);
    });
  };

  c.moveFocus = function(event) {

	var eventElement;
	if ( event && event.target )
		eventElement = event.target.id;
	if ( !eventElement )
		  return;
	
	
	//TODO: Need to revisit for a better solution.
	$timeout( function() {
		var ele = $('button[id^="close-"]');
		if ( ele.length > 0 ) {
			c.manageRecommendationFocus(eventElement, c.options.maxResults);
		} else if ( ele.length === 0 ){
			$('#show-more').focus();
			$('#show-less').focus();
		} else {
			c.focusActiveTab();
		}}, 0);
};

	c.removeRegister = function(reco, modal, lastEvent) {
		c.server.get({reco_id: reco.sys_id, action: 'remove_register'}).then(function (result) {
			if (!result.data.success)
				return;
			spUtil.addInfoMessage(i18n.format(c.data.messages.cim.removeSuccess, reco.register.number));
			reco.register = {sys_id: '', state: '', number: ''};
			modal.close();
			c.moveFocus(lastEvent);
		});
	};

	c.updateRegister = function(reco, register, modal, isNewRegister, lastEvent) {
		c.server.get({reco_id: reco.sys_id, register: register, action: 'update_register'}).then(function (result) {
		  if (!result.data.success || !result.data.register)
			return;
		  reco.register = result.data.register;
		  if(!isNewRegister)
			  spUtil.addInfoMessage(i18n.format(c.data.messages.cim.associateSuccess, reco.register.number));
		  if (reco.register.state.value === c.data.INITIATIVE_STATES.CLOSED)
			  c.updateState(reco.sys_id, c.states.implemented,lastEvent);
		  else if (reco.state !== c.states.accepted)
			  c.updateState(reco.sys_id, c.states.accepted,lastEvent);
		  modal.close();
		});
	};

	c.modalInstanceCtrl = function ($scope, $uibModalInstance, reco, lastEvent) {
		$scope.reco = reco;
		$scope.lastEvent= lastEvent;

		$scope.handleSubmit = function (event, initiative) {
		  $('body').off(event, $scope.handleSubmit);
		  c.updateRegister(reco, initiative, $uibModalInstance, true, $scope.lastEvent);
		  c.moveFocus($scope.lastEvent);
		};

		if(reco.isNewRegister) {
		  reco.isNewRegister = false;
		  $('body').on('DismissCIMModal', $scope.handleSubmit);
		}

		$scope.field = {
			sys_id: '',
			name: 'sn_cim_register',
			refTable: 'sn_cim_register',
			value: '',
			attributes:'ref_ac_columns=short_description;number,ref_ac_columns_search=true,ref_auto_completer=AJAXTableCompleter',
			ed: {reference: 'sn_cim_register', queryString: 'state!=4'},
			isMandatory: function(){return false;},
			label: c.data.messages.cim.existingCIM
		};

		$scope.displayColumn = 'short_description';

		var uiMessageHandler = function(g_form, type, message) {
			switch (type) {
				case 'addInfoMessage':
					spUtil.addInfoMessage(message);
					break;
				case 'addErrorMessage':
					spUtil.addErrorMessage(message);
					break;
				case 'clearMessages':
					break;
				default:
			}
		};

		$scope.getGlideForm = function() {
			return glideFormFactory.create($scope, $scope.field.refTable, $scope.field.sys_id, [$scope.field], null, {
				uiMessageHandler: uiMessageHandler});
		};

		$scope.updateExistingRegister = function(registerId) {
			c.updateRegister(reco, registerId, $uibModalInstance, false, lastEvent);
			c.moveFocus(lastEvent);
		};
		$scope.dismiss = function() {
			$uibModalInstance.close();
			c.moveFocus(lastEvent);
		};
		$scope.removeExistingRegister = function() {
			c.removeRegister(reco, $uibModalInstance, lastEvent);
		};
	};


  $rootScope.$on('$locationChangeSuccess', function() {
    $uibModalStack.dismissAll();
  });

	c.getCIMURL = function(reco) {
		var urlMessage      = i18n.format(c.data.messages.cim.url, reco.url);
		var content         = reco.strippedContent;
		var url             = (!!reco.url) ? ' ' + urlMessage : '';
		var populatedFields = {
			'short_description': reco.name,
			'description': content + url,
			'indicator': c.data.recommendations.pa_indicator.sys_id,
			'current_kpi_value': c.data.recommendations.pa_indicator.score,
			'source_table': c.RECO_TABLE,
			'source_id': reco.sys_id
		};
		var query = Object.keys(populatedFields).map(function(field) {
			return field + '=' + populatedFields[field];
		});
		var gotoUrl     = '$cim_external_url_handler.do?sysparm_initiative=$sys_id';
		var queryParams = {
			'sys_id': -1,
			'sysparm_query': query.join('^'),
			'sysparm_clear_stack': true,
			'sysparm_goto_url': gotoUrl
		};
		return '/sn_cim_register.do?' + jQuery.param(queryParams);
	};

	c.openModal = function(reco, template, size, lastEvent) {
		reco.src = c.getCIMURL(reco);
		var modalInstance = $uibModal.open ({
			controller: c.modalInstanceCtrl,
			templateUrl: template,
			size: size,
			resolve: {
				reco: function() {
					return reco;
				},
				lastEvent: function() {
				  return lastEvent;
				}
			}
		});
	};
	
	c.openRemoveRegister = function(reco, event) {
		c.openModal(reco, 'remove_register.html', 'md', event);
	};

	c.encodeURIComponent = function(uri) {
		return encodeURIComponent(uri);
	};

}
