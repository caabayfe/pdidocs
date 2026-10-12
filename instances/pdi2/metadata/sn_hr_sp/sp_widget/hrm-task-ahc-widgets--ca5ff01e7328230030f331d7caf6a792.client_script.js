function hrmTaskAHCWidgetsController($scope, $rootScope, $timeout, spUtil, i18n, $window, spContextManager, spAgentChat) {
  /* widget controller */
	var c = this;
	var MOBILE_DEVICE_SCREEN_WIDTH = 767;
	$scope.mobileDevice = c.data.isMobile || ($window.innerWidth < MOBILE_DEVICE_SCREEN_WIDTH);
	$scope.moreInfoCollapsed = true;
	$scope.toggleMoreInfo = function() {
		$scope.moreInfoCollapsed = !$scope.moreInfoCollapsed;
	};
	
	$scope.closePopup = function() {
		$('#more_information').focus();
	};

	$(function () {
		$('[data-tooltip="true"]').tooltip()
	});
	
	$scope.selectedTab = 'details';
	
	c.tabsList = {
		details: {
			name: i18n.getMessage("Details"),
			aria: i18n.getMessage("Open details"),
			value: 'details',
			display: true
		},
		
		chat: {
			name: i18n.getMessage("Ask a Question"),
			aria: i18n.getMessage("Open chat"),
			value: 'chat',
			widget: 'chatWidget',
			display: true
		},

		attachment: {
			name: i18n.getMessage("Attachments"),
			aria: i18n.getMessage("Open attachments, add attachments"),
			value: 'attachment',
			widget: 'attachmentWidget',
			display: true
		},

		activity: {
			name: i18n.getMessage("Activity"),
			aria: i18n.getMessage("Open activity, view conversation history or type new message"),
			value: 'activity',
			widget: 'historyWidget',
			display: true
		}
	};

	$scope.tabs = [c.tabsList.details, c.tabsList.activity, c.tabsList.chat];
	$scope.mobileTabs = [c.tabsList.attachment, c.tabsList.activity, c.tabsList.chat];

	$scope.getWidgetId = function(widget) {
		return "task_popup_menuitem_"+widget+'_'+c.data.taskNumber;
	};

	$(document).on('click', 'div.modal-footer button.btn, ul#ahc-task-tabs .dropdown-menu', function (e) {
		e.stopPropagation();
	});

	$(document).bind('dragover drop', function(event){
		event.preventDefault();
		return false;
	});
	
	$('body').on('click', function (e) {
		removeClasses();
		if (c.data.isConnectConfigured) {
			var chatPopup = document.querySelector('#ask_a_question');
			if ($("#ask_a_question").is(":visible") && !$(e.target).is('#chat_popup') && !$(e.target).parent().is('#chat_popup') && !chatPopup.contains(e.target)) {
				chatPopup.style.display = 'none';
			}
		}
	});
	
	$scope.selectTab = function(tab) {
		$scope.selectedTab = tab;

		var data = { tab: tab };
		$rootScope.$broadcast('sn_hr_sp.todoTabSelected', data);
	}
	
	$scope.scrollChat = function() {
		function scrollAndFocus() {
			var openTab = $('.question-tab.open');
				if (openTab.length) {
					var messageWrapper = openTab.find('.sn-feed-message-wrapper');
					var scrollPosition = messageWrapper.parent()[0].scrollHeight;
					messageWrapper.parent().scrollTop(scrollPosition);
					var messageInput = openTab.find('.message-input');
					messageInput.focus();
				}
		}
		
    var isConnect = c.data.isConnectConfigured;
    var isActive = c.data.isConversationActive;
    var isNASS = c.data.isNASSEnabled;

    if(isConnect) {
		var chatPopup = document.querySelector('#ask_a_question');
		chatPopup.style.display = 'block';
		scrollAndFocus();

		if (!chatPopup.__popupListenerExists) {
			chatPopup.addEventListener('keydown', function(event) {
				if (event.key === 'Escape') {
					chatPopup.style.display = 'none';
					var askAQuestionButton = $('#chat_popup');
					askAQuestionButton.focus();
				}
			});
			chatPopup.__popupListenerExists = true;
		}
    }
		
		 if (!isConnect && !isActive && !isNASS) {
			spContextManager.getContextForKey('agent-chat', true).then(function(context) {
			context = context || {};	
			context.show_ask_a_question_prechat = true;
			context.demo_variable = !context.demo_variable;
			context.task_sys_id = c.data.task_sys_id;
			context.hr_case_coe = c.data.hr_case_coe;
			context.sys_id = c.data.parent_case_sys_id;
			context.table = c.data.parent_case_table_name;
			context.task_number = c.data.task_number;
			context.parent_case_sys_id = c.data.parent_case_sys_id;
			context.task_awa_queue = c.data.task_awa_queue;
			context.search_text = c.data.search_text;
			context.task_tablename = c.data.table;
			spContextManager.updateContextForKey('agent-chat', context);
			});
		}
		setTimeout(function() {
			if(c.data.chatConfigError) {
				spUtil.addErrorMessage(i18n.getMessage("Please contact your system administrator for support."));
				return;
			}
			if(!isConnect && !isNASS) {
				spAgentChat.getFrameUrl().then(function (frameUrl) {
					var iFrame = angular.element(".sp-ac-frame").scope();
					$('div.sp-ac-container').show();
					if(!iFrame.c.isOpen) {
						if(!c.data.isConversationActive)
							iFrame.c.frameUrl = frameUrl; 
						iFrame.c.toggle();
					}
				});
			}
			else if (!isConnect && isNASS) {
				window.nowAssistDynamicWindow.open({
				  context: {
				    show_ask_a_question_prechat: true,
				    task_sys_id: c.data.task_sys_id,
				    hr_case_coe: c.data.hr_case_coe,
				    sys_id: c.data.parent_case_sys_id,
				    table: c.data.parent_case_table_name,
				    task_number: c.data.task_number,
				    parent_case_sys_id: c.data.parent_case_sys_id,
				    task_awa_queue: c.data.task_awa_queue,
				    search_text: c.data.search_text,
				    task_tablename: c.data.table
				  },
				  forceNewConversation: true
				});
			} else {
				scrollAndFocus();
			}
		});
	}
	
	// Accessibility for tab navigation
	$scope.$applyAsync(function() {
		new Tab("ahc-task-tabs");
	});

	function Tab(id) {
		this._id = id;
		this.$tpanel = $('#' + id);
		this.$tabs = this.$tpanel.find('.tab');
		this.bindHandlers();
	}

	Tab.prototype.keys = {left: 37, right: 39};
	Tab.prototype.switchTabs = function($curTab, $newTab) {
		var $curLink = $curTab.find('a'),
		$newLink = $newTab.find('a');
		$curTab.removeClass('active');
		$curLink.attr('tabindex', '-1').attr('aria-selected', 'false');
		$newTab.addClass('active');
		$newLink.attr('aria-selected', 'true');
		$newLink.attr('tabindex', '0');
		$timeout(function(){
			$newLink.click();
			$newLink.focus();
		});
	}

	Tab.prototype.bindHandlers = function() {
		var self = this;
		this.$tabs.keydown(function(e) {
		  return self.handleTabKeyDown($(this), e);
		});
	}

	Tab.prototype.moveToPreviousOrNext = function(e, $tab, next) {
		var $newTab, tabIndex;
		tabIndex = this.$tabs.index($tab);
		var index = (next) ? this.$tabs.length - 1 : 0;
		if (tabIndex === index) {
			$newTab = (next) ? this.$tabs.first() : this.$tabs.last();
		} else {
			var newIndex = (next) ? tabIndex + 1 : tabIndex - 1;
			$newTab = this.$tabs.eq(newIndex);
		}
		this.switchTabs($tab, $newTab);
		e.preventDefault();
		return false;
	}

	Tab.prototype.handleTabKeyDown = function($tab, e) {
		if (e.keyCode == this.keys.left) {
			this.moveToPreviousOrNext(e, $tab);
		} else if (e.keyCode == this.keys.right) {
			this.moveToPreviousOrNext(e, $tab, true);
		}
	}

	function removeClasses() {
		var tabsLocator = $scope.mobileDevice? 'div#mobile_popup_items': 'ul#ahc-task-tabs';
		$(tabsLocator+' div.ticket_conversation').removeClass('b panel');
		$(tabsLocator+' div.ticket_question').removeClass('b panel');
		$(tabsLocator+' div.attachment .panel-').removeClass('b panel');
		$('[id=attachments_popup]').find('.panel').removeClass('b panel');
		$('[id=attachments_popup]').find('.panel-heading').removeClass('panel-heading');
		$('#attachments_popup .panel-body').removeClass('panel-body');
		
		var paperClip = $('#item_' + c.data.taskNumber + '_attachment .panel-heading.padder-b-none:first');
		if (paperClip.length == 1)
			$('#item_' + c.data.taskNumber + '_attachment').prepend(paperClip.detach());

		if ($('#item_' + c.data.taskNumber + '_attachment .panel-body .panel-body:eq(1) li').length > 0)
			$('#item_' + c.data.taskNumber + '_attachment div.sp-no-attachments:eq(0)').hide();
		else
			$('#item_' + c.data.taskNumber + '_attachment div.sp-no-attachments:eq(0)').show();

		var attachmentElementID = $scope.mobileDevice? "#task_popup_menuitem_attachment_" +c.data.taskNumber : "#item_" + c.data.taskNumber + '_attachment';
		var attachmentLength = $(attachmentElementID+ ' li.list-group-item').length;

		if (attachmentLength != 0) {
			$(attachmentElementID +' li.list-group-item').each(function(index) {
				if (index == 0)
					$(this).addClass('no-round-lower');
				else if (index == attachmentLength - 1)
					$(this).addClass('no-round-upper');
				else {
					$(this).addClass('no-round-upper');
					$(this).addClass('no-round-lower');
				}
			});
		}
	}
}
