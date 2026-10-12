api.controller = function(ActionParameterService, $rootScope, $scope, spModal, $http, $window, spUtil, $location, snAnalytics, i18n, $timeout, spAuthModal) {
    /* widget controller */
    var c = this;

    c.handleEnterKeyPress = function(event, action) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            event.stopPropagation();
            $scope.handleClick(action);
        }
    }

    function loadFromClientIfRequested(options) {
        if (options.client_side_load) {
            var serverData = {
                action: 'retrieveActions',
                context: options.context,
                max_button_count: options.max_button_count,
                action_group: options.action_group,
                table: options.table,
                more_icon: options.more_icon,
                button_direction_reversed: options.button_direction_reversed,
                primary_colored_button: options.primary_colored_button
            };
            c.server.get(serverData).then(function(response) {
                c.data = response.data;
                c.emitWidgetVisibility();
            });
        }
    }

    $scope.$watchCollection('c.options', function(newValue, oldValue) {
        if (!newValue && !oldValue)
            return; // Initial state, no action needed

        loadFromClientIfRequested(newValue);
    });

    loadFromClientIfRequested(c.options);

    $scope.dropdownToggle = function(elem) {
        setTimeout(function() {
            $scope.$emit('action.toggle.dropdown', elem);
        });
    };

    $scope.handleClick = function(action) {
        c.assignDynamicParameters(action);
        var esignatureRequired = action.clientParams['isEsignatureEnabled'] != undefined && action.clientParams['isEsignatureEnabled'].value == 'true' && c.data.esignRequiredObj.e_sign_required;
        if (action.hasServerScript) {
            if (action.reverseExecution == "0") {
                if (esignatureRequired) {
                    openEsignatureModal(action);
                } else {
                    runServerScript(action);
                }
            } else {

                new Promise(function(resolve, reject) {
                    try {
                        var clientScriptOutput = c.executeClientScript(action);
                        resolve(clientScriptOutput);
                    } catch (error) {
                        reject(error);
                    }
                }).then(function(clientScriptOutput) {
                    action.serverScriptInputs['clientScriptOutput'] = clientScriptOutput;
                    if (esignatureRequired) {
                        openEsignatureModal(action);
                    } else {
                        runServerScript(action);
                    }
                });
            }
        } else {
            var actionFinalOutput = c.executeClientScript(action);
	    if (shouldBroadcastActionResultEvent(action)) {
		$rootScope.$broadcast('sn_ex_sp_action.result', actionFinalOutput);
	    }
        }
    };

    c.executeClientScript = function(action, serverScriptOutput) {
        if (action.clientScript) {
            var clientParams = Object.keys(action.clientParams).map(function(x) {
                return "var " + x + " = " + c.resolveClientParam(action.clientParams[x]) + ";";
            }).join('\n');
            var serverVal = serverScriptOutput ? "var serverScriptOutput=" + JSON.stringify(serverScriptOutput) + ";" : "";
            var evalString = "return function($rootScope, $scope, spModal, $http, $window, spUtil, $location, snAnalytics, i18n, $timeout) {\
                        var answer = '';\
                        " + serverVal + clientParams + action.clientScript + "\
                        return answer;};";
            var fn = Function(evalString);
            return fn()($rootScope, $scope, spModal, $http, $window, spUtil, $location, snAnalytics, i18n, $timeout);
        }
    };

    c.resolveClientParam = function(param) {
        if (param.hasOwnProperty('param_type')) {
            if (param.param_type == 'json')
                return param.value;
            if (param.param_type == 'dynamic' && (Array.isArray(param.value) || param.value.prototype)) {
                return JSON.stringify(param.value);
            }
            return "'" + String(param.value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
        }
        return "'" + String(param).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    };

    c.getFlexDirection = function() {

        var style = {
            'flex-direction': 'row'
        };
        if (c.data.button_direction_reversed) {
            style['flex-direction'] = 'row-reverse';
        }
        if ($window.innerWidth <= 500 && c.data.max_button_count > 1) {
            style['flex-direction'] = 'column';
        }
        return style;
    };

    c.getDropdownWidth = function() {
        var style = {};
        if ($window.innerWidth <= 500 && c.data.max_button_count > 1) {
            style.width = '-webkit-fill-available';
            style['text-align'] = 'center';
        }
        return style;
    };

    c.emitWidgetVisibility = function() {
        if ((c.data.actionButtons && c.data.actionButtons.length > 0) || (c.data.otherActions && c.data.otherActions.length > 0)) {
            $scope.$emit('isActionWidgetVisible', {
                'visibility': true,
                'context': c.data.context
            });
        } else {
            $scope.$emit('isActionWidgetVisible', {
                'visibility': false,
                'context': c.data.context
            });
        }
    };

    c.emitWidgetVisibility();

    ActionParameterService.listen(function(e, data) {

        // Set value of dynamic params for this action group
        Object.keys(data).forEach(function(param) {
            if (c.data.dynamicParameterMap.hasOwnProperty(param))
                c.data.dynamicParameterMap[param] = data[param];
        });
    });

    c.assignDynamicParameters = function(action) {
        [action.clientParams, action.serverScriptInputs].map(function(paramsObj) {
            Object.keys(c.data.dynamicParameterMap).forEach(function(param) {
                if (paramsObj[param]) {
                    paramsObj[param].value = c.data.dynamicParameterMap[param];
                }
            });
        });

    };

    function runServerScript(action) {
        c.server.get({
            action: 'getServrOutput',
            actionId: action.actionId,
            actionInputs: JSON.stringify(action.serverScriptInputs)
        }).then(function(resp) {
	    var actionFinalOutput = action.reverseExecution == "0" ? c.executeClientScript(action, resp.data.actionOutput) : resp.data.actionOutput;
	
	    if (shouldBroadcastActionResultEvent(action)) {
		$rootScope.$broadcast('sn_ex_sp_action.result', actionFinalOutput);
	    }
        });
    }

    function openEsignatureModal(action) {
        var requestParams = {
            username: c.data.esignRequiredObj.username,
            userSysId: c.data.esignRequiredObj.userSysId
        };
        spAuthModal.prompt(requestParams, requestParams.username, requestParams.userSysId).then(null, function() {
            spUtil.addErrorMessage(c.data.CONST.i18n.REAUTH_FAILED_MESSAGE);
        }).then(function() {
            raiseAppseeEvent();
            if (action.clientParams['broadcastEventName']) {
                $rootScope.$broadcast(action.clientParams['broadcastEventName'].value, null);
            }
            $http.post('/api/sn_ex_sp/action/executeServerScript', {
                actionId: action.actionId,
                actionInputs: JSON.stringify(action.serverScriptInputs),
                table: c.data.table,
                context: c.data.context
            }).then(function(response) {
                if (response && response.data && response.data.result) {
		    var actionFinalOutput = action.reverseExecution == "0" ? c.executeClientScript(action, response.data.result.actionOutput) : response.data.result.actionOutput;
					
		    if (shouldBroadcastActionResultEvent(action)) {
		        $rootScope.$broadcast('sn_ex_sp_action.result', actionFinalOutput);
		    }
                }
            }, function(reason) {
                spUtil.addErrorMessage(c.data.CONST.i18n.REAUTH_FAILED_MESSAGE);
                $log.error(reason);
            });
        });
    }

    function raiseAppseeEvent() {
        var payload = {};
        payload.name = "E-signature for Actions";
        payload.data = {};
        payload.data["User id"] = c.data.esignRequiredObj.userSysId;
        snAnalytics.addEvent(payload);
    }
        	
    /**
    * Helper to determine if we should broadcast the result event.
    * Suppress broadcasting 'sn_ex_sp_action.result'
    * when Action's input client parameter has "disableActionResultBroadcast" enabled.
    **/
    function shouldBroadcastActionResultEvent(action) {
	if (!action || !action.clientParams || !action.clientParams["disableActionResultBroadcast"]) {
	    return true;
	}

        return action.clientParams["disableActionResultBroadcast"].value !== 'true';
    }

};
