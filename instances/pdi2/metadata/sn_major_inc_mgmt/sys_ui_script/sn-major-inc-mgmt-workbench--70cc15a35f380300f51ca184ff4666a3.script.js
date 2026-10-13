(function($j){
	angular.module("sn.mim.bench", ["sn.common", "ui.bootstrap", "ngRoute", "sn.ngform.elements", "sn.ngform.components.record_preview", "sn.common.presence"])
		.config(function ($uibTooltipProvider) {
			var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;
			if (isTouchDevice) {
				var options = {
					trigger: 'none'
				};
				$uibTooltipProvider.options(options);
			}
		})
		.value('isAccessibilityEnabled', function () {
			return window.g_accessibility == 'true';
		}).controller("BenchController", function($scope, $q, $http, snCustomEvent, $window, $timeout, $uibModal, i18n, connectService, hasComposeEmail, DisableAutoAddMembers, isAccessibilityEnabled, $location) {

	var mimBenchCtrl = this;
	var ESC = 27;
	mimBenchCtrl.isA11yEnabled = isAccessibilityEnabled();
	this.formatMessage = function(msgKey, args) {
		return i18n.format(i18n.getMessage(msgKey), args);
	};
	var chat = new connectService($window.task.table,
								  $window.task.sys_id,
								  $window.task.conversation_id);

	$j(document).on('close-form-modal', function() {
		if(mimBenchCtrl.modalInstance)
			mimBenchCtrl.modalInstance.close();
		if(mimBenchCtrl.glideModal)
			mimBenchCtrl.glideModal.destroy();
		mimBenchCtrl.modalInstnace = undefined;
		mimBenchCtrl.glideModal = undefined;
	});
	$j(document).on('keydown', function(e) {
		if(e.keyCode != ESC)
			return;
		$scope.$apply(function(){
			mimBenchCtrl.alerts = [];
		});
	});

	function removeHostPartFromUrl(url) {
		if (!url)
			return '';
		var hostIdx = url.indexOf('://');
		if (hostIdx === -1)
			return url;
		var firstSlash = url.indexOf('/', hostIdx + 3);
		if (firstSlash === -1)
			return '/';
		return url.substring(firstSlash);
	}
	function updateUrlParam(key, value) {
		$location.search(key, value);
		$scope.params[key] = value;
		snCustomEvent.fireTop('magellanNavigator.permalink.set', {
			relativePath: removeHostPartFromUrl($location.absUrl())
		});
	}
	$scope.communication = {};
	$scope.conference = {};
	$scope.params = $location.search();
	$scope.views = ['summary', 'communication', 'conference'];
	$scope.communicationTabs = ['information', 'activity', 'email_log'];
	$scope.conferenceTabs = ['information', 'activity'];
	if ($scope.views.indexOf($scope.params.view) == -1) {
		updateUrlParam('view', 'summary');
	}
	if ($scope.communicationTabs.indexOf($scope.params.communication_tab) == -1) {
		updateUrlParam('communication_tab', 'information');
	}
	if ($scope.conferenceTabs.indexOf($scope.params.conference_tab) == -1) {
		updateUrlParam('conference_tab', 'information');
	}
	mimBenchCtrl.view = $scope.params.view;
	$scope.communication.tab = $scope.params.communication_tab;
	$scope.conference.tab = $scope.params.conference_tab;
	mimBenchCtrl.setup = function() {
		initDefaults();
		getSummaryDetails();
		getCommunicationDetails();
	};
	$scope.mimBenchCtrl = mimBenchCtrl;
	$scope.hasComposeEmail = hasComposeEmail;

	function initDefaults() {
		mimBenchCtrl.childIncidents = [];
		mimBenchCtrl.affectedCIs = [];
		mimBenchCtrl.impactedServices = [];
		mimBenchCtrl.task = task;
		mimBenchCtrl.props = props;
		mimBenchCtrl.alerts = [];
	}
	$scope.selectTab = function(type, tab) {
		updateUrlParam(type + '_tab', tab);
		$scope[type].tab = tab;
	};
	function getAlertConversationId(alert) {
		if (g_incident_alert_conversations) {
			var cid = g_incident_alert_conversations[alert.sys_id.value];
			if (cid)
				return cid;
		}
		return null;
	}
	mimBenchCtrl.closeAlert = function (i) {
		mimBenchCtrl.alerts.splice(i, 1);
		$j('#load_element').focus();
	};
	mimBenchCtrl.addAlert = function (type, msg) {
		var hasAlert = mimBenchCtrl.alerts.length !== 0;
		mimBenchCtrl.alerts = [];
		$timeout(function () {
			mimBenchCtrl.alerts.push({
				type: type,
				msg: msg
			});
		}, hasAlert ? 1000 : 0);
	};
	function getSummaryDetails() {
		mimBenchCtrl.summayApiInProgress = true;

		var sysIdPattern = /^[0-9a-fA-F]{32}$/;
		var taskSysId = mimBenchCtrl.task.sys_id;
		if (typeof taskSysId !== 'string' || !sysIdPattern.test(taskSysId)) {
			mimBenchCtrl.summayApiInProgress = false;
			return;
		}

		mimBenchCtrl.getData("/api/sn_major_inc_mgmt/mim/status/" + taskSysId).then(function(data) {
			var closeModalUrl = "&sysparm_referring_url=sn_major_inc_mgmt_closeFormModal.do?sysparm_stack=no";
			mimBenchCtrl.childIncidents = data.child_incident;
			mimBenchCtrl.affectedCIs = data.affected_ci;
			mimBenchCtrl.impactedServices = data.impacted_service;
			mimBenchCtrl.childIncidents.link.edit += closeModalUrl;
			mimBenchCtrl.affectedCIs.link.edit += closeModalUrl;
			mimBenchCtrl.impactedServices.link.edit += closeModalUrl;
			mimBenchCtrl.summayApiInProgress = false;
		}, function(data) {
			mimBenchCtrl.summayApiInProgress = false;
		});
	}
	function getCommunicationDetails() {
		var sysIdPattern = /^[0-9a-fA-F]{32}$/;
		var taskSysId = mimBenchCtrl.task.sys_id;
		if (typeof taskSysId !== 'string' || !sysIdPattern.test(taskSysId))
			return;

		mimBenchCtrl.getData("/api/sn_major_inc_mgmt/mim/communication/" + taskSysId).then(function(data) {
			$scope.incidentAlerts = data.incident_alert;
			$scope.groups = data.group;
			$scope.users = data.user;
			for (var userId in $scope.users) {
				var user = $scope.users[userId];
				user.groups = [];
				for (var groupId in $scope.groups) {
					var group = $scope.groups[groupId];
					angular.forEach(group.user, function(groupUser) {
						if (groupUser === userId)
							user.groups.push(groupId);
					});
				}
			}
			if ($scope.incidentAlerts && $scope.incidentAlerts.length > 0) {
				angular.forEach($scope.incidentAlerts, function(incidentAlert) {
					incidentAlert.conference = {};
					incidentAlert.conference.participants = [];
					if (incidentAlert.notify_conference_call)
						incidentAlert.current_conference_call = incidentAlert.notify_conference_call[0];
					else
						incidentAlert.current_conference_call = {};
					angular.forEach(incidentAlert.current_conference_call.user_participant, function(userId) {
						if (userId) {
							var participant = {};
							participant.liveProfile = {};
							participant.sys_id = userId;
							participant.liveProfile.sys_id = participant.sys_id;
							participant.userID = participant.sys_id;
							var user = $scope.users[participant.userID];
							if (user) {
								participant.name = user.name.display_value;
								participant.groups = user.groups;
								participant.liveProfile.name = participant.name;
								participant.liveProfile.displayName = user.name.display_value;
								participant.liveProfile.avatar = user.live_profile.avatar;
								participant.liveProfile.initials = user.live_profile.initials;
							}
							incidentAlert.conference.participants.push(participant);
						}
					});
					if ($scope.params.incident_alert) {
						if (incidentAlert.sys_id.value == $scope.params.incident_alert)
							$scope.selectIncidentAlert(incidentAlert);
					}
				});
				if (!$scope.params.incident_alert)
					$scope.selectIncidentAlert($scope.incidentAlerts[0]);
			}
		});
	}
	var parseResponse = function(result) {
		return result;
	};
	mimBenchCtrl.getData = function(api) {
		var deferred = $q.defer();
		$http.get(api + "?sysparm_ck=" + g_ck).then(function(response) {
			deferred.resolve(parseResponse(response.data.result));
		}, function(response) {
			deferred.reject(response);
		});
		return deferred.promise;
	};
	$scope.selectIncidentAlert = function(incidentAlert) {
		$scope.selectedIncidentAlert = incidentAlert;
		updateUrlParam('incident_alert', incidentAlert.sys_id.value);
		setConferenceUserAction($scope.selectedIncidentAlert);
		$scope.selectedIncidentAlert.notesLink = "/incident_alert.do?sys_id=" + incidentAlert.sys_id.value + "&sysparm_view=mim_act&sysparm_titleless=true&sysparm_link_less=true&sysparm_view_forced=true&sysparm_stack=no&sysparm_nofocus=true";
		$scope.showConferenceParticipants = false;
		$timeout(function() {
			$scope.showConferenceParticipants = true;
		});
	};
	function setConferenceUserAction(incidentAlert) {
		var incidentAlertState = incidentAlert.state.value;
		incidentAlert.isActive = false;
		if (incidentAlertState != 'cancelled' && incidentAlertState != 'resolved' && incidentAlertState != 'closed')
			incidentAlert.isActive = true;
		if (incidentAlert.isActive && mimBenchCtrl.props.is_ia_admin && !incidentAlert.current_conference_call.sys_id && mimBenchCtrl.props.notifyNumber)
			incidentAlert.conference.userAction = 'initiate';
		else if (incidentAlert.isActive && incidentAlert.current_conference_call.sys_id) {
			incidentAlert.conference.active = true;
			var userAlreadyJoined = false;
			angular.forEach(incidentAlert.conference.participants, function(participant) {
				if (participant.sys_id == mimBenchCtrl.props.loggedInUserId) {
					userAlreadyJoined = true;
					incidentAlert.conference.userAction = 'joined';
				}
			});
			if (mimBenchCtrl.props.canJoin) {
				if (!userAlreadyJoined)
					incidentAlert.conference.userAction = 'join';
			}
		}
	}
	snCustomEvent.observe('DismissMIMFormDialog', function() {
		if (mimBenchCtrl.modalInstance)
			mimBenchCtrl.modalInstance.close();
		$scope.$apply(function() {
			mimBenchCtrl.setup();
		});
	});
	snCustomEvent.observe('DismissMIMGlideModal', function() {
		angular.element('#conference_call_participants .modal-header .icon-cross').click();
		$scope.$apply(function() {
			mimBenchCtrl.setup();
		});
		if(mimBenchCtrl.focusElementAfterModalClose && $j(document, mimBenchCtrl.focusElementAfterModalClose)) {
		   $j(mimBenchCtrl.focusElementAfterModalClose).focus();
		   mimBenchCtrl.focusElementAfterModalClose = undefined;
		}
	});
	$scope.viewForm = function() {
		var url = "/api/now/sla/glidestack/top";
		$http({
			method : "POST",
			url : url
		}).then(function(response) {
			var url = response.data.result.url;
			if( (url.indexOf("incident.do?") == 0) && (url.indexOf("?sys_id=" + mimBenchCtrl.task.sys_id) != -1 || url.indexOf("&sys_id=" + mimBenchCtrl.task.sys_id) != -1))
				$window.location.replace(url);
			else
				$window.location.replace('/' + mimBenchCtrl.task.table + '.do?sys_id=' + mimBenchCtrl.task.sys_id);
		});
	};
	$scope.viewIncident = function(sysId) {
		$window.open('nav_to.do?uri=' + encodeURIComponent('incident.do?sysparm_stack=no&sys_id=' + sysId), '_blank');
	};
	$scope.viewCI = function(sysId) {
		$window.open('nav_to.do?uri=' + encodeURIComponent('cmdb_ci.do?sysparm_stack=no&sys_id=' + sysId), '_blank');
	};
	$scope.back = function() {
		//sla timeline api is used here as GlideSession is not accessable in scoped app
		var url = "/api/now/sla/glidestack/get";
		$http({
			method : "POST",
			url : url
		}).then(function(response) {
			window.location = response.data.result.url;
		});
	};
	$scope.createOutage = function() {
		$http.post("/api/sn_major_inc_mgmt/mim/outage/" + mimBenchCtrl.task.sys_id + "?sysparm_ck=" + g_ck).then(function(response) {
			mimBenchCtrl.modalInstance = $uibModal.open({
				templateUrl: 'iframe_modal.html',
				controller: function($scope) {
					$scope.title = i18n.getMessage("Create Outage");
					$scope.url = '/cmdb_ci_outage.do?sys_id=' + response.data.result + "&sysparm_goto_url=sn_major_inc_mgmt_closeFormModal.do?sysparm_stack=no&sysparm_nofocus=true";
					$scope.close = function() {
						mimBenchCtrl.modalInstance.close();
					};
				},
				size: 'lg',
				backdrop: 'static'
			});
		}, function(response) {
			mimBenchCtrl.addAlert('danger', response.data.error.message);
		});
	};
	$scope.createchildIncident = function() {
 		var gotoUrl = [];
 		gotoUrl.push('srcSysID=' + mimBenchCtrl.task.sys_id);
 		gotoUrl.push('newSysID=$sys_id');
 		gotoUrl.push('sysparm_returned_action=$action');
 		gotoUrl = 'sn_major_inc_mgmt_Copy_Related_Lists.do?sysparm_nofocus=true&sysparm_stack=no&' + gotoUrl.join('&');
		var encodedQuery = encodeURIComponent("parent_incident="+mimBenchCtrl.task.sys_id);
		mimBenchCtrl.modalInstance = $uibModal.open({
				templateUrl: 'iframe_modal.html',
				controller: function($scope) {
					$scope.title = i18n.getMessage('Create Child Incident');
					$scope.url = "/incident.do?sysparm_view=mim_child_incident&sys_id=-1&sysparm_nofocus=true&sysparm_stack=no&sysparm_goto_url="+encodeURIComponent(gotoUrl)+"&sysparm_query=" + encodedQuery;
					$scope.close = function() {
						mimBenchCtrl.modalInstance.close();
					};
				},
				size: 'lg',
				backdrop: 'static'
		});
	};
	$scope.open = function(element, type) {
		if (type === 'list') {
			$window.open('nav_to.do?uri=' + encodeURIComponent(mimBenchCtrl[element].link[type]), '_blank');
			return;
		}
		mimBenchCtrl.modalInstance = $uibModal.open({
				templateUrl: 'iframe_modal.html',
				controller: function($scope) {
					$scope.url = mimBenchCtrl[element].link[type];
					$scope.element = element;
					$scope.close = function() {
						mimBenchCtrl.modalInstance.close();
					};
				},
				windowClass: element == 'childIncidents' ? 'addChildIncidents':'',
				size: 'lg',
				backdrop: 'static'
			});
	};
	$scope.setFocusToModal = function(sel) {
		setTimeout(function() {
			var el = $j(sel).get(0);
			if(!el)
				return;
			el.setAttribute('tabIndex', "-1");
			el.focus();
		}, 1000);
	},
	$scope.openCI = function(element, $event) {
	var target = $event.target;
    var gajax = new GlideAjax("global.AssociateCIToTask");
	gajax.addParam("sysparm_name","getURL");
	gajax.addParam("sysparm_id", mimBenchCtrl.task.sys_id);
	if (element == 'affectedCIs')
	    gajax.addParam("sysparm_add_to", "task_ci");
	else if (element == 'impactedServices')
		gajax.addParam("sysparm_add_to", "task_cmdb_ci_service");
	gajax.getXMLAnswer(openList);
	function openList(url){
		var cmdbciModal = new GlideModal('task_add_affected_cis');
		cmdbciModal.setTitle(element == 'affectedCIs' ? i18n.getMessage("Add Affected CIs"):i18n.getMessage("Add Impacted Services/CIs"));
		cmdbciModal.template = glideModalTemplate;
		cmdbciModal.setWidth(1200);
		cmdbciModal.setAutoFullHeight(true);
		cmdbciModal.on('beforeclose', function(){
			refreshAffectedCIs();
		});
		cmdbciModal.renderIframe(url, function(event) {
			glideModalKeyDownHandler(event, cmdbciModal.getID());
		});

		mimBenchCtrl.glideModal = cmdbciModal;
	}
		function refreshAffectedCIs() {
		mimBenchCtrl.setup();
		target.focus();
	}
		function resizeIframe(){
		var x = g_glideBoxes.cm_add_affected_cis;
		x.autoDimension();
		x.autoPosition();
		x._createIframeShim();
		var iframe = x.getIFrameElement();
		iframe.contentWindow.scrollTo(0,0);
		$scope.setFocusToModal('#cm_add_affected_cis');
		$j(document).trigger('modalframe-loaded', iframe);
	}
};
	$scope.addChildIncidents = function($event) {
		var modal = new GlideModal('add_child_incidents');
		modal.template = glideModalTemplate;
		modal.setTitle(i18n.getMessage("Add Child Incidents"));
		modal.setWidth(1200);
		modal.setAutoFullHeight(true);
		modal.on('beforeclose', function() {
			mimBenchCtrl.setup();
		});
		modal.renderIframe("add_child_incidents.do?sysparm_sys_id=" + mimBenchCtrl.task.sys_id + "&sysparm_view=add_child_incidents&sysparm_table=incident&sysparm_nostack=true&sysparm_query=ORDERBYDESCsys_created_on", function(event) {
			glideModalKeyDownHandler(event, modal.getID());
		});
	};
	$scope.initiateConferenceCall = function($event) {
		var dialog = new GlideModal('conference_call_participants');
		dialog.setTitle(i18n.getMessage("Initiate Conference Call"));
		dialog.setPreference("sourceID", $scope.selectedIncidentAlert.sys_id.value);
		dialog.setPreference("invokedFrom", "mim_wb");
		dialog.setPreference("focusTrap", true);
		dialog.render();
		$scope.setFocusToModal('#conference_call_participants');
		mimBenchCtrl.focusElementAfterModalClose = $event.target;
	};
	$scope.addParticipants = function($event) {
		var dialog = new GlideModal('conference_call_participants');
		dialog.setTitle("Conference call participants");
		dialog.setPreference("sourceID", $scope.selectedIncidentAlert.sys_id.value);
		dialog.setPreference("conferenceCallID", $scope.selectedIncidentAlert.current_conference_call.sys_id.value);
		dialog.render();
		$scope.setFocusToModal('#conference_call_participants');
		mimBenchCtrl.focusElementAfterModalClose = $event.target;
	};
	$scope.joinConferenceCall = function() {
		$scope.joinConferenceCallInProgress = true;
		var sourceId = $scope.selectedIncidentAlert.sys_id.value;
		var ccId = $scope.selectedIncidentAlert.current_conference_call.sys_id.value;
		var ga = new GlideAjax('global.IncidentAlertNotifyAjax');
		ga.addParam('sysparm_participants', mimBenchCtrl.props.loggedInUserId);
		ga.addParam('sysparm_id', sourceId);
		ga.addParam('sysparm_ccid', ccId);
		ga.addParam('sysparm_name' , 'addToConferenceCall');
		ga.getXML(addParticipantCallback);

		function addParticipantCallback(response) {
			$scope.$apply(function() {
				$scope.joinConferenceCallInProgress = false;
			});
			var xml     = response.responseXML;
			var items   = xml.getElementsByTagName("conference_call_participant");
			var success = items[0].getAttribute("success");
			if (success == "true")
				mimBenchCtrl.setup();
			else
				console.log(response);
		}
	};
	$scope.openEmailClient = function (iaTask) {
		$scope.showEmailClient = true;
		$scope.emailClientUrl = "/email_client.do?sysparm_table=incident_alert_task&sysparm_target=incident_alert_task&sysparm_nofocus=true&sysparm_stack=no&sysparm_sys_id=" + iaTask.sys_id.value + "&sys_uniqueValue=" + iaTask.sys_id.value;
		$scope.selectedTask = iaTask;
	};
	$scope.hideEmailClient = function () {
		$scope.showEmailClient = false;
	};
	$window.g_hideEmailClient = function () { // Used by email client's iframe onload function.
		$timeout(function () {
			$scope.hideEmailClient();
			mimBenchCtrl.addAlert('success', i18n.getMessage('Mail queued for sending'));
			$scope.communication.tab = 'email_log';
		});
	};
	$scope.isUpdateDue = function (index) {
		var firstActiveIdx = -1;
		if ($scope.selectedIncidentAlert && $scope.selectedIncidentAlert.ia_tasks) {
			for (var i = 0; i < $scope.selectedIncidentAlert.ia_tasks.length; i++) {
				var t = $scope.selectedIncidentAlert.ia_tasks[i];
				if (t.active.value === 'true' && hasComposeEmail(t)) {
					firstActiveIdx = i;
					break;
				}
			}
		}
		if (index === firstActiveIdx)
			return true;
		return false;
	};
	$scope.closeTask = function (iaTask) {
		var url = "/api/now/table/incident_alert_task/" + iaTask.sys_id.value + "?sysparm_ck=" + g_ck;
		$http({
			method : "PUT",
			url : url,
			data: {
				state: 3
			}
		}).then(function(response) {
			mimBenchCtrl.addAlert('success', i18n.getMessage('Incident Communciation Task closed'));
			getCommunicationDetails();
			$scope.setFocusToModal('#load_element');
		}, function(response) {
			mimBenchCtrl.addAlert('danger', i18n.getMessage('Incident Communciation Task closure failed'));
		});
	};
	$scope.isMiniChat = chat.isMiniChatAvailable.bind(chat);
	$scope.isChatEnabled = chat.isChatEnabled.bind(chat);
	$scope.openChat = chat.followAndOpenChat.bind(chat);
	$scope.isChatNotInit = function () {
		if (DisableAutoAddMembers)
			return false;
		if ($scope.selectedIncidentAlert && $scope.selectedIncidentAlert.chat) {
			return !$scope.selectedIncidentAlert.chat.isFollowing();
		}
		return false;
	};
	$scope.processingChat = {};
	$scope.openAlertChat = function () {
		if ($scope.selectedIncidentAlert) {
			var sysId = $scope.selectedIncidentAlert.sys_id.value;
			if ($scope.isChatNotInit()) {
				if ($scope.processingChat[sysId])
					return;
				$scope.processingChat[sysId] = true;
				var allAlertMembersPromise = $http.get('/api/sn_major_inc_mgmt/mim/incident_alert/' + sysId + '/members?sysparm_ck=' + g_ck);
				$scope.selectedIncidentAlert.chat.followDirect().then(function (conversation) {
					allAlertMembersPromise.then(function (response) {
						if (response.data && response.data.result) {
							var participants = response.data.result;
							var participantsNotAlreadyMember = participants.filter(function (p) {
								return !conversation.members.some(function (m) {
									return p.user_id === m.sys_id;
								});
							});
							$timeout(function () {
								$scope.selectedIncidentAlert.chat.followAndOpenChat();
								participantsNotAlreadyMember.forEach(function (p) {
									// If we swap the system with many requests rapidly,
									// then it will ignore requests from this client for some time
									$timeout(function () {
										$http({
											method: 'POST',
											url: '/api/now/connect/conversations/' + conversation.sys_id + '/members?sysparm_ck=' + g_ck,
											data: {
												member_id: p.user_id
											}
										});
									}, 200, false);
								});
								$scope.processingChat[sysId] = false;
							}, 100);
						} else {
							$scope.processingChat[sysId] = false;
							console.error('No data on fetching alert members', response.data);
						}
					}, function (e) {
						$scope.processingChat[sysId] = false;
						console.error('Fetching alert members failed', e);
					});
				}, function (e) {
					$scope.processingChat[sysId] = false;
					console.error('Follow direct failed', e);
				});
			} else {
				$scope.selectedIncidentAlert.chat.followAndOpenChat();
			}

		}
	};
	$scope.$watch('selectedIncidentAlert', function () {
		$scope.hideEmailClient();
	});
	$scope.$watchCollection('incidentAlerts', function () {
		if ($scope.incidentAlerts)
			$scope.incidentAlerts.forEach(function (alertIncident) {
				if (!alertIncident.chat)
					alertIncident.chat = new connectService('incident_alert', alertIncident.sys_id.value, getAlertConversationId(alertIncident));
			});
	});
	$scope.$watch('mimBenchCtrl.view', function () {
		$scope.hideEmailClient();
	});
	$scope.selectView = function(view) {
		mimBenchCtrl.view = view;
		updateUrlParam('view', view);
	};
}).controller('EmailLogCtrl', function ($scope, $http) {
	function postProcessEmails(emails) {
		if (emails) {
			var userNames = [];
			emails.forEach(function (e) {
				if (userNames.indexOf(e.sys_created_by.value) === -1)
					userNames.push(e.sys_created_by.value);
				e.sys_created_on.timestamp = moment(e.sys_created_on.value, "YYYY-MM-DD HH:mm:ss").unix();
			});
			$http.get('/api/now/table/sys_user?sysparm_query=' + encodeURIComponent("user_nameIN" + userNames.join(',')) + "&sysparm_fields=user_name%2Csys_id%2Cname&sysparm_ck="+g_ck).then(function (response) {
				if (response.data && response.data.result) {
					var uMap = {};
					response.data.result.forEach(function (u) {
						uMap[u.user_name] = u;
					});
					emails.forEach(function (e) {
						var u = uMap[e.sys_created_by.value];
						if (u) {
							e.sys_created_by.user_id = u.sys_id;
							e.sys_created_by.name = u.name;
						} else
							e.sys_created_by.initials = e.sys_created_by.display_value.substring(0, 1).toUpperCase();
					});
				}
			});
		}
	}
	$scope.$watch("selectedIncidentAlert", function () {
		$http.get('/api/sn_major_inc_mgmt/mim/incident_alert/' + $scope.selectedIncidentAlert.sys_id.value + '/emails').then(function (response) {
			$scope.emails = response.data.result;
			postProcessEmails($scope.emails);
		});
	});
}).factory('connectService', function ($http, $q) {
	function connect(table, sysId, conversationId) {
		var isFollowing = !!conversationId;
		var recordDetails = {conversationID: conversationId, table: table, sysID: sysId};

		function canOpenInFrameset() {
			return window.top.NOW.collaborationFrameset;
		}

		function openRedirect(follow) {
			var followParam = (typeof follow !== "undefined") ? "sysparm_follow=" + follow + "&" : "";
			window.open("/$connect_record_redirect.do?" +
				"sysparm_document=" + sysId + "&" +
				"sysparm_table=" + table + "&" +
				followParam +
				"ieCacheBust=" + new Date().getTime(), "_blank");
		}

		this.isChatEnabled = function () {
			return props.isChatEnabled;
		};
		this.isMiniChatAvailable = function () {
			return canOpenInFrameset();
		};
		this.isFollowing = function () {
			return isFollowing;
		};
		this.follow = function () {
			if (isFollowing)
				return;
			if (canOpenInFrameset())
				CustomEvent.fireTop('connect:follow_document', recordDetails);
			else
				openRedirect(true);
			isFollowing = true;
		};
		this.followDirect = function () {
			if (isFollowing)
				return;
			var d = $q.defer();
			$http({
				method: 'POST',
				url: '/api/now/connect/conversations/records?sysparm_ck=' + g_ck,
				data: {
					sys_id: sysId,
					table: table
				}
			}).then(function (response) {
				if (response.data.result) {
					isFollowing = true;
					recordDetails.conversationID = conversationId = response.data.result.sys_id;
					d.resolve(response.data.result);
				} else {
					d.reject();
				}
			}, function () {
				d.reject();
			});
			return d.promise;
		};
		this.unfollow = function () {
			if (!isFollowing)
				return;
			if (canOpenInFrameset())
				CustomEvent.fireTop('connect:unfollow_document', recordDetails);
			else
				openRedirect(false);
			isFollowing = false;
		};
		this.followAndOpenChat = function () {
			if (!isFollowing)
				this.follow();
			if (canOpenInFrameset())
				CustomEvent.fireTop('connect:open_group', recordDetails);
			else
				openRedirect();
		};
	}
	return connect;
})
.directive('mimRecordPreview',
		function(getTemplateUrl, $document, snCustomEvent, i18n, $timeout, $window) {
			return {
				restrict: 'E',
				scope: {
					incident: '=',
					index: '='
				},
				templateUrl: 'incident_preview.html',
				link: function($scope, iEl, iAttrs, ctrls) {
					/*start of link function*/
					/*end of link function*/
				},
				controller: function($scope, $element) {
					/*start of directive's controller*/
					var openRecordEventHandler;
					$scope.viewName = 'mim_form';
					$scope.recordPreviewPopoverConfig = {
						placement: 'auto right'
					};
					function openRecord(event) {
						$window.location = '/incident.do?sys_id=' + $scope.incident.sys_id.value;
					}
					openRecordEventHandler = $scope.$on('openRecord', openRecord);
					$scope.$on('$destroy', function () {
						openRecordEventHandler();
					});
				}
			};
	});
})(jQuery);
