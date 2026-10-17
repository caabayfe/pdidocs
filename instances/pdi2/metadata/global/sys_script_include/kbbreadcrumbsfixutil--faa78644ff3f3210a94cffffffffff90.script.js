var KBBreadcrumbsFixUtil = Class.create();
KBBreadcrumbsFixUtil.prototype = {
    initialize: function() {},

    restoreWidget: function() {
        var widget = new GlideRecord('sp_widget');
        if (!widget.get('851b8947db20320099f93691f0b8f5ea')) {
            return;
        }
        if (widget.sys_scope.scope.toString() === 'sn_km_center') {
            var um = new GlideUpdateManager2();
            var xmlContent = `<?xml version="1.0" encoding="UTF-8"?><record_update table="sp_widget">
  <sp_widget action="INSERT_OR_UPDATE">
    <category/>
    <client_script><![CDATA[function($scope, $rootScope, $timeout) {	
	var c = this;			
	
	$rootScope.showKbHomeLink = c.data.showKbHomeLink;
	
	$scope.$on("sp.update.breadcrumbs", function(e, list) {		
		c.breadcrumbs = list;
	});
	
	$timeout(function(){
		if($rootScope.readOnly){
			$(".nav-pills").find("a").removeAttr("href").addClass("disabled"); 
		}
	},200);
 
}]]></client_script>
    <controller_as>c</controller_as>
    <css>.nav-pills i {
	margin-top: 5px;
	padding-right: 7px;
	padding-bottom: 15px;
        display: inline;
}

.disabled{
  text-decoration:none;
  cursor:default;
  color:$text-color;
}

.breadcrumbs {
	padding-left: 5px; 
	padding-top: 15px;
}

.nav-pills li a {
	padding: 0px;
        padding-right: 7px;
}

.nav-pills &gt; li + li {
    margin-left: 0px;
}

.typeahead-search {
	padding-right: 0px; 
}</css>
    <data_table>sp_instance_ais</data_table>
    <demo_data/>
    <description/>
    <docs/>
    <field_list>search_application,search_results_configuration,disable_all_suggestions,placeholder,ai_search_source_filter</field_list>
    <has_preview>false</has_preview>
    <id>kb-breadcrumbs</id>
    <internal>false</internal>
    <link><![CDATA[function(scope){
		var c = scope.c;
        if (window && window.parent && window.parent.NOW && window.parent.NOW.CustomEvent && window.parent.NOW.CustomEvent.fireTop) {
            window.parent.NOW.CustomEvent.fireTop(
                'magellanNavigator.permalink.set', {
                    title: window.document.title,
                    relativePath: window.location.pathname + window.location.search + window.location.hash
                }
            );
        }
		function openedInIframe () {
		if (window.parent && window.parent.location.pathname == '/gtb.do')
				return false;
		try {
			if(window.opener && window.opener.document.getElementById("section_form_id") != null && c.data.sysparm_kb_search_table){
				$('.breadcrumbs-container').css("display","none");
				return true;
			}
			return false;
		} catch (e) {
			return false;
		}
	}
	
	if(openedInIframe()){
		$("header nav").css("display","none");
		$(".container").css("width","100%");	
	}
	if((window.self !== window.top) && (window.top.location.href.includes('now/nav') || window.top.location.href.includes('nav_to')
))
		$("header nav").css("display","none");
}]]></link>
    <name>Knowledge Breadcrumbs</name>
    <option_schema>[{"displayValue":"","hint":"Show the search box","name":"show_search_box","display_value_list":[],"section":"Behavior","default_value":"","label":"Show Search Box","type":"boolean"}]</option_schema>
    <public>true</public>
    <roles/>
    <script><![CDATA[(function() {
	data.sysparm_kb_search_table = $sp.getParameter('sysparm_kb_search_table');
	data.page_id = $sp.getParameter('id');
	
	data.showSearchBox = (options.show_search_box && options.show_search_box == "true") || false;
	var portalRecord = $sp.getPortalRecord();
	var portal = portalRecord.getUniqueValue();
	if ($sp.isAISearchEnabled())
		data.search_options = options;
	else
		data.search_options = options.search_options || {};
	data.showKbHomeLink = (portal != '45d6680fdb52220099f93691f0b8f5ad');

	var sysId = $sp.getParameter('sys_kb_id');
	var number = $sp.getParameter('sysparm_article');
	var kbViewModel = new global.KBViewModel();
	data.short_description = "";
	if (sysId) {
		kbViewModel.findKnowledgeById(sysId);
	} else if (number) {
		kbViewModel.findKnowledgeByNumber(number);
	}
	if(kbViewModel && kbViewModel.knowledgeRecord && kbViewModel.knowledgeRecord.short_description) {
		data.short_description = kbViewModel.knowledgeRecord.short_description.getDisplayValue();
	}
})();]]></script>
    <servicenow>true</servicenow>
    <sys_class_name>sp_widget</sys_class_name>
    <sys_created_by>admin</sys_created_by>
    <sys_created_on>2017-01-30 15:43:53</sys_created_on>
    <sys_id>851b8947db20320099f93691f0b8f5ea</sys_id>
    <sys_mod_count>48</sys_mod_count>
    <sys_name>Knowledge Breadcrumbs</sys_name>
    <sys_package display_value="Knowledge Management - Service Portal" source="sn_km_portal">bab6dea3db20320099f93691f0b8f590</sys_package>
    <sys_policy/>
    <sys_scope display_value="Knowledge Management - Service Portal">bab6dea3db20320099f93691f0b8f590</sys_scope>
    <sys_update_name>sp_widget_851b8947db20320099f93691f0b8f5ea</sys_update_name>
    <sys_updated_by>admin</sys_updated_by>
    <sys_updated_on>2026-03-09 12:36:22</sys_updated_on>
    <template><![CDATA[<div ng-class="c.data.showSearchBox ? 'col-md-8' : 'col-md-12'" class="breadcrumbs">
<ul class="nav nav-pills nav-sm" role="list">
	<li role="listitem"><a tabindex="0" ng-href="?id={{portal.homepage_dv}}">\${Home}</a></li>
  	<li aria-hidden="true"><i class="fa fa-chevron-right flip-icon-rtl"></i></li>
  	<li ng-if="portal.homepage_dv != 'kb_home'" role="listitem"><a ng-href="?id={{$root.showKbHomeLink? portal.kb_knowledge_page_dv : 'kb_home'}}">\${Knowledge}</a></li>
  	<li ng-if="portal.homepage_dv != 'kb_home'" aria-hidden="true"><i class="fa fa-chevron-right flip-icon-rtl"></i></li>
  	<li ng-if="!c.breadcrumbs && c.data.page_id!='kb_article_view'" role="listitem"><a tabindex="0" href ng-bind="::page.title"></a></li>
  	<li ng-repeat-start="item in c.breadcrumbs" role="listitem">
    	<a ng-href="{{::item.url}}" ng-bind="::item.label"></a>
  	</li>
  	<li ng-repeat-end aria-hidden="true">
    	<i class="fa fa-chevron-right flip-icon-rtl"></i>
  	</li>
    <li ng-if="c.breadcrumbs && c.breadcrumbs.length" role="listitem">
		<span>{{::c.data.short_description}}</span>
	</li>
</ul>
</div>
<div ng-if="c.data.showSearchBox" class="col-md-4 typeahead-search">
	<widget id="typeahead-search" options="data.search_options"></widget>
</div>


<style>
  @media only screen and (max-width: 991px){
    
    main {
      padding-top : 0px !important;
    }
  }
</style>]]></template>
  </sp_widget>
</record_update>`;
            um.loadXML(xmlContent);
            gs.log('kb-breadcrumbs widget scope and content restored to sn_km_portal', 'KBBreadcrumbsFixUtil');
        }
    },

    type: 'KBBreadcrumbsFixUtil'
};
