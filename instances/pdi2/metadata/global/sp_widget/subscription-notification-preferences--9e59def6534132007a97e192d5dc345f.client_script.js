function($scope, $timeout, $interval, $http, $rootScope, $location, $anchorScroll, $uibModal, ActsubRestService) {
	/* widget controller */
	var c = this,
			baseApiUrl = '/api/now/v1/actsub/',
			firstSetup = $location.search().setupPref ? (parseInt($location.search().setupPref) == 1): false,
			alertDismissInterval = 5000;
	
	ActsubRestService.init(c.data);
	if(c.data.isCommunityPluginActive)
		qsConfigJson = JSON.parse(c.data.portal_default_config)[0];

	c.enableNotifications = true;
	c.showNotifications = true;
	c.hasMoreRecords = false;
	c.firstRow = 0;
	c.lastRow = c.data.config.pageSize;	
	c.selectedSubObject = {};
	c.subObjects = [];
	c.selectedModule = c.data.modules.length ? c.data.modules[0] : null;
	c.changedPrefsArray = [];

	c.diff = (c.options.max_modules_mobile - c.data.modules.length);
	
	if(c.data.isCommunityPluginActive){
		c.getUiPageMapping = function (contentId, field){
			for(i=0; i < qsConfigJson.uiPageMapping.length; i++){
				if(contentId == qsConfigJson.uiPageMapping[i].contentTypeId)
					return qsConfigJson.uiPageMapping[i][field];
			}
		};	
	}
	c.viewNetwork = function(){
		window.location = '?id=community_user_profile&tab=network';
	};
	c.toggleSettings = function(e){
		$(e.target).parents('.cm-settings-parent').find('.cm-settings-main').slideToggle();
		$(e.target).parents('.cm-settings-parent').find('.cm-toggle-icon').toggleClass('cm-display-none');
	};

	if($location.search().showNotification) {
		c.showNotifications = true;
		$('.cm-noti-tab').addClass('active');
		$('.cm-subs-tab').removeClass('active');
	}
	
	function getGlobalNotificationState () {
		c.enableNotifications  = c.data.fanout_to_stream;
		/* As per PM, no need to keep Profile level notification in sync.
		ActsubRestService.getUserNotificationState().then(function () {
			c.enableNotifications = c.data.enable_notifications;
			//create Primary email if not already existing.
			if (!c.data.user_channels.hasOwnProperty('email'))
				c.server.get({action: 'createPrimaryEmailChannel'}).then(function (res) {
					c.data.user_channels.email = res.data.new_channel;
				});
		});
		*/
	}
	getGlobalNotificationState();
	c.toggleGlobalNotifications = function(){
		c.cancelPreferences();
		ActsubRestService.toggleAllNotifications(c.enableNotifications);
	};
	
	function showTabHelper (e) {
		$(e.currentTarget).parents('.nav-tabs').find('li').removeClass('active');
		$(e.currentTarget).addClass('active');
	}
	c.showTab = function(tab, e){
		var success = false;
		if(tab == 'n'){
			c.showNotifications = true;
			success = true;
			c.subcategoryCounter=0;
		}
		else {
			if (c.changedPrefsArray.length)
				showConfirmModal(this, function () {
					c.showNotifications = false;
					showTabHelper(e);
				});
			else {
				c.showNotifications = false;
				success = true;
			}
			c.subcategoryCounter=1;
		}
		if (success)
			showTabHelper(e);
	};
	c.showAnsweredIcon = function(sub){
		if(sub.content_details && sub.content_details.answered)
			return true;
		return false;
	};
	function getSubscriptions(subObj, showMore){
		$http.get(baseApiUrl + 'subscriptions/'+c.data.liveProfileId + '?objType=' + subObj.sys_id 
							+'&setupPref=' + (firstSetup? 1 : 0) + '&orderBy=recent&firstRow=' + c.firstRow
							+ '&lastRow=' + c.lastRow
						 )
			.then(function(data){
			if(data.data && data.data.result){
				if(showMore && data.data.result.subscriptions
					 && data.data.result.subscriptions.length > 0)
					subObj.subscriptions = subObj.subscriptions.concat(data.data.result.subscriptions);
				else
					subObj.subscriptions = data.data.result.subscriptions;
				c.hasMoreRecords = data.data.result.hasMoreRecords;
			}
		});
	}
	c.showMore = function(){
		c.firstRow = c.lastRow;
		c.lastRow = c.firstRow + c.data.config.pageSize;	
		getSubscriptions(c.selectedSubObject, true);		
	};
	
	function changeModuleHelper(module, e, fromMore) {
		c.selectedModule = module;
		c.hideMoreText = fromMore;
		c.init();

		//Need to do this because ng-class stops working when Modal window opens.
		//timeout is needed becauase this is a DOM change.
		$timeout(function () {
			$('#mod_'+c.selectedModule.sys_id, '#mod1_'+c.selectedModule.sys_id).siblings().removeClass('active');
			if (!fromMore)
				$('#mod_'+c.selectedModule.sys_id, '#mod1_'+c.selectedModule.sys_id).addClass('active');
			else{
				$('#mod_more_option', '#mod1_more_option').addClass('active');
				var p =$('#mod_more_option button');
				if(p.parent('li').parent('ul').css('display')=='block')
					p.focus();
				else
					$('#mod1_more_option button').focus();
			}
		});
		c.moduleTabCounter = c.data.modules.indexOf(c.selectedModule);
	}	
	c.changeModule = function (module, e, fromMore) {
		if (c.changedPrefsArray.length)
			showConfirmModal(this, function (x,y,mod) {
				changeModuleHelper(mod, e, fromMore);
			}, module);
		else 
			changeModuleHelper(module, e, fromMore);
	}

	function showConfirmModal (context, fn) {
		var pageRoot = angular.element('.sp-page-root');
		var args = arguments,
				modalInstance = $uibModal.open({
					animation: true,
					ariaLabelledBy: 'modal-title',
					ariaDescribedBy: 'modal-body',
					templateUrl: 'activity-discard-confirm.html',
					controller: function($scope) {
						$scope.cancel = function() { modalInstance.dismiss('cancel'); };
						$scope.confirm = function() {
							modalInstance.close();
							c.cancelPreferences();
							if (fn)
								fn.apply(context, args);			
						};
					}
				});
		modalInstance.rendered.then(function() {
				//hide the root page headings when modal is active
				pageRoot.attr('aria-hidden', 'true');
				$('#modal-close').focus();
			});
		modalInstance.closed.then(function(){
				pageRoot.attr('aria-hidden', 'false');
			});
	}

	c.init = function () {
		if (c.selectedModule)
			$http.get(baseApiUrl + 'subobjects?setupPref=' + (firstSetup? 1 : 0) + '&module=' + c.selectedModule.sys_id)
				.then(function(data){
				if(data.data && data.data.result && data.data.result.subObjects.length){
					c.subObjects = data.data.result.subObjects;
					c.selectedSubObject = c.subObjects[0];
					if (c.selectedSubObject.framework != 'legacy')
						getSubscriptions(c.selectedSubObject);
					getPreferences(c.selectedSubObject);
					$timeout(function(){  
						c.subModuletabs= $('.submoduletablist').children("[role='tab']");
					});
				}
			});
	};

	///init
	c.init();

	function selectSubObjectHelper (subObj, e) {
		$(e.currentTarget).siblings().removeClass('active');
		$(e.currentTarget).addClass('active');
		$(e.currentTarget).toggleClass('b-none');
		c.selectedSubObject = subObj;
		//reset curosr
		c.firstRow = 0;
		c.lastRow = c.data.config.pageSize;	
		if(c.selectedSubObject.sys_id != '46f9d003db723200624273c8f0b8f54c' && c.selectedSubObject.framework != 'legacy'){
			getSubscriptions(subObj);//No need to fetch any subscription records for Network tab
		}
		getPreferences(subObj);
		c.toggleSettings(e);
		c.subModuleTabCounter = c.subObjects.indexOf(c.selectedSubObject);
	}
	c.selectSubObject = function(subObj, e){
		if (c.changedPrefsArray.length)
			showConfirmModal(this, function () {
				selectSubObjectHelper(subObj, e);
			});
		else
			selectSubObjectHelper(subObj, e);
	};

	c.getSubTemplate = function(sub,type){
		sub.type = type;
		if(sub.content_details)
			return 'actsub_subs_detail';
		return 'actsub_subs_compact';
	};

	c.getProcessedDisplaySubName = function(sub){
		var colonIndex = sub.sub_obj_display_value.indexOf(":");
		return (colonIndex > -1)?sub.sub_obj_display_value.substring(colonIndex + 1).trim():sub.sub_obj_display_value.trim();
	};

	c.getPageUrl = function(sub){
		var url = $rootScope.portal.url_suffix,
				pageId = '';
		if(c.selectedSubObject.sys_id == '6cbd03c467103200ace49a6617415ac4'){//forum
			pageId = 'community_forum';
		}
		else if (c.selectedSubObject.sys_id == '17bd03c467103200ace49a6617415aed'){//topic
			pageId = 'community_topic';
		}
		else if (c.selectedSubObject.sys_id == 'ef7d03c467103200ace49a6617415a51'){//question
			pageId = 'community_question';
		}
		else if (c.selectedSubObject.sys_id == '5e9d03c467103200ace49a6617415a70'){//blog
			pageId = 'community_blog';
		}
		else if (c.selectedSubObject.sys_id == '8dad03c467103200ace49a6617415a76'){//video
			pageId = 'community_video';
		}
		else if (c.selectedSubObject.sys_id == 'cba41981533232007a97e192d5dc343d'){//document
			pageId = 'community_document';
		}
		else if(c.selectedSubObject.sys_id == 'adf03c68c312320012e45cb981d3aeed'){
			pageId = 'community_event';
		}
		else if (c.selectedSubObject.sys_id == '46f9d003db723200624273c8f0b8f54c'){//Community Users (Profile)
			var profileLink = url + '?id=community_user_profile' + '&user=' + sub.sub_obj_id;
			if(sub.image)
				sub.image.profileLink = profileLink;
			return profileLink;
		}	
		else if (c.selectedSubObject.sys_id == '722d67c367003200d358bb2d07415a9c'){//Knowledge Base
			if(c.data.kmPortalUrl){
				return url +'?id=kb_search&kb_knowledge_base='+sub.sub_obj_id;
			}
			else{
				return '$knowledge.do?sysparm_type_filter=all&sysparm_kb='+sub.sub_obj_id;				
			}
		}
		else if (c.selectedSubObject.sys_id == '7d8f537453003200fa9bd7b08cc5872c'){//Knowledge Articles
			if(c.data.kmPortalUrl){
				return url +'?id=kb_article_view&sys_kb_id='+sub.sub_obj_id;
			}
			else{
				return 'kb_view.do?sys_kb_id='+sub.sub_obj_id;
			}
		}else if(c.data.isIdeaPluginActive && c.selectedSubObject.sys_id == '62d8370577407300d82ea3334a1061e2'){//Idea
				 return url + '?id=view_idea&sysparm_idea_id='+sub.sub_obj_id;
				 }
		return url + '?id='+ pageId + '&sys_id=' + sub.sub_obj_id;
	};
	c.doSubscribe = function(action, sub, idx){
		if(action == 'DELETE'){
			$http({
				method: action,
				url: baseApiUrl + 'subscriptions/'+sub.sub_obj_id+'/unsubscribe'
			}).then(function(data){
				sub.unsubscribed = true;
				$timeout(function() {
					var subToggle = angular.element('#'+sub.type+'_unsubscribe-focus' + idx+'-'+sub.sub_obj_id);
					if (subToggle && subToggle.is(":visible")) {
						subToggle.focus();
					}
				});
			});	
		}
		else{
			$http.post(baseApiUrl + 'subscriptions/'+sub.sub_obj_id+'/subscribe', {type: c.selectedSubObject.sys_id})
				.then(function(data){
				sub.unsubscribed = false;
				$timeout(function() {
					var subToggle = angular.element('#'+sub.type+'_subscribe-focus' + idx+'-'+sub.sub_obj_id);
					if (subToggle && subToggle.is(":visible")) {
						subToggle.focus();
					}
				});
			});
		}
	};
	
	c.formatMessage = function(messageText, params) {
		return messageText.replace(/\{(\d+)\}/g, function() {
			return params[arguments[1]];
		});
	};

	//Notification logic
	function getPreferences(subObj) {
		subObj.genPreferences = {};
		c.activityLoading = true;
		ActsubRestService.getPreferences(subObj).then(function (resp) {
			subObj.genPreferences = resp;
			//check for Notification Device
			if (subObj.framework == 'legacy' && subObj.genPreferences.activities.length && !c.data.user_channels.hasOwnProperty('email'))
				c.server.get({action: 'createPrimaryEmailChannel'}).then(function (res) {
					c.data.user_channels.email = res.data.new_channel;
				});
			c.activityLoading = false;
		});
	}

	c.prefChanged = function(pref) {
		var p = c.changedPrefsArray.indexOf(pref);
		if (p > -1)
			c.changedPrefsArray.splice(p, 1);
		else
			c.changedPrefsArray.push(pref);
	};
	
	c.checkBoxKeyPress = function (e) {
		if (e.which === 13) {
			if ($(e.currentTarget).is('input'))
				$(e.currentTarget).click();
			else
				$(e.currentTarget).siblings('input').click();
				$(e.currentTarget).siblings('input').focus();
		}else if ($(e.currentTarget).is('span')){
			$timeout(function(){
				$(e.currentTarget).siblings('input').click();
				$(e.currentTarget).siblings('input').focus();
			});
		}
	};

	c.savePreferences = function(activity){
		var payLoad = [],
				dummy = activity ? payLoad.push(activity): payLoad = c.changedPrefsArray;
		if (!payLoad.length)
			return;
		ActsubRestService.savePreferences(payLoad , c.selectedSubObject).then(function (res) {
			c.changedPrefsArray = [];
			$scope.$emit('$$uiNotification', [{		
				message: c.data.msg.prefSaved,
				type: 'success'}]);
		});	
	};

	c.cancelPreferences = function(){
		c.changedPrefsArray.forEach(function(act) {
			act.pref_code.email = !act.pref_code.email;
		});
		c.changedPrefsArray = [];
	};

	c.getActivitiesToLoop = function(sortOn){
		if(sortOn)
			return sortOn.genPreferences ? sortOn.genPreferences.activities : [];
		else
			return c.selectedSubObject.genPreferences ? c.selectedSubObject.genPreferences.activities : [];
	};

	//////Responsiveness
	function resizeDivs(b , c){
		b = b || '';
		c = c || '';
		$('.cm-subs-noti-pref .cm-subs-list-item .content-icon').css('padding-right', b);
		$('.cm-subs-noti-pref .cm-subs-list-item .content-header').css('width', c);	
	}

	var interval;
	function windowResized() {
		var viewPortWidth = $(window).width();
		if (viewPortWidth < 380){
			if(interval){
				$interval.cancel(interval);
				interval = null;
			}	
			interval = $interval(function(){
				resizeDivs('5px','80%');
			}, 50);
		}
		else if (viewPortWidth < 660){
			if(interval){
				$interval.cancel(interval);
				interval = null;
			}	
			interval = $interval(function(){
				resizeDivs('10px','85%');
			}, 50);
		}
		else if (viewPortWidth < 1210){
			if(interval){
				$interval.cancel(interval);
				interval = null;
			}	
			interval = $interval(function(){
				resizeDivs('','90%');
			}, 50);
		}
		else{
			$interval.cancel(interval);
			interval = null;
			resizeDivs();
		}
	}

	var timeout;
	$(window).resize(function() {
		if(timeout){
			$timeout.cancel(timeout);
			timeout = null;
		}
		timeout = $timeout(windowResized, 50);
	});

	$(document).ready(function(){
		timeout = $timeout(windowResized, 50); 
	});

	//--/
	c.checkInputCheckBox = function(e){
		if ($(e.currentTarget).is('span')){
            //timeout function to avoid angular.apply errors
			$timeout(function(){$(e.currentTarget).siblings('input').click()});
		}else if(e.which==13 && $(e.currentTarget).is('input')){
			$timeout(function(){$(e.currentTarget).click();});
	}
}
/*
 * Below code is handle the 
 * Right/Left navigation between tabs(horizontal orientation).
 * Up/Down navigation between tabs(vertical orientation).
*/
c.modulestabs= '';
c.subModuletabs='';
c.subcategoryTabs='';
c.subcategoryCounter=0;
c.moduleTabCounter=0;
c.subModuleTabCounter = 0;
c.ARROW_DOWN='ArrowDown';
c.ARROW_UP='ArrowUp';
c.ARROW_RIGHT='ArrowRight';
c.ARROW_LEFT='ArrowLeft';
	
//
loadTabsArrayOnload();
function loadTabsArrayOnload() {
    $timeout(function() {
        c.modulestabs = $('.moduletablist').children("[role='tab']");
        c.subcategoryTabs = $('.subcattablist').children("[role='tab']")
    });
}

c.tablistKeydown = function(e, id) {
    if (id == 'subModule' && (e.key === c.ARROW_DOWN || e.key === c.ARROW_UP)) {
        c.focusTab(e.key, id);
    } else if (id != 'subModule' && (e.key === c.ARROW_RIGHT || e.key === c.ARROW_LEFT)) {
        c.focusTab(e.key, id);
    }
}
c.focusTab = function(keyCode,id) {
	var tabs=c.getTabArray(id);
	var tabFocus=c.getCounter(id);
  tabs[tabFocus].setAttribute("tabindex", -1);
	if (keyCode === c.ARROW_RIGHT || keyCode === c.ARROW_DOWN) {
		tabFocus++;
		// If we're at the end, go to the start
		if (tabFocus >= tabs.length) {
			tabFocus = 0;
		}
		// Move left
	} else if (keyCode === c.ARROW_LEFT || keyCode === c.ARROW_UP) {
		tabFocus--;
		// If we're at the start, move to the end
		if (tabFocus < 0) {
			tabFocus = tabs.length - 1;
		}
	}
	//set tabindex
	tabs[tabFocus].setAttribute("tabindex", 0);
	//give focus
	tabs[tabFocus].focus();
	//set the counter value
	c.setCounter(id,tabFocus);
}

c.getCounter = function(id){
	if(id=='category')
		return c.subcategoryCounter;
	else if(id=='module')
		return c.moduleTabCounter;
	else if(id=='subModule')
		return c.subModuleTabCounter;
	return 0;		
}
c.getTabArray = function(id) {
    if (id == 'category')
        return c.subcategoryTabs;
    else if (id == 'module')
        return c.modulestabs;
    else if (id == 'subModule')
        return c.subModuletabs;
    return [];
}
c.setCounter = function(id, val) {
    if (id == 'subModule')
        c.subModuleTabCounter = val;
    else if (id == 'module')
        c.moduleTabCounter = val;
    else if (id == 'category')
        c.subcategoryCounter = val;
}
}
