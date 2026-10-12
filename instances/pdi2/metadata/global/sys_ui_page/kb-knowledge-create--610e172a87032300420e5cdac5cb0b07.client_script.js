$j('title').html("${gs.getMessage('Create new article')}");

var app = angular.module("createKnowledge",[]);

app.controller("kb_knowledge_create", function($scope, $sce) {
	$scope.selectedKB = "$[kbId]";
	$scope.selectedTemplate = "";
	$scope.autoselectedTemplate = "$[templateId]";
	$scope.sourceTable = "$[sourceTable]";
	$scope.sourceId = "$[sourceId]";
	$scope.templatesLoading = false;
	$scope.previewLoading = false;
	$scope.templatesListPresent = false;
	$scope.templatesEmpty = false;
	onInit();
	
	function onInit(){
		$scope.kblist = JSON.parse('$[JS:JSON.stringify(kblist)]');
		if($scope.selectedKB){
			var updatedKBList = $scope.kblist.filter(function(item) {
    			return item.value === $scope.selectedKB;
			});
			$scope.kblist = updatedKBList;
			getTemplatesList($scope.selectedKB);
		}
		$scope.ipsums = [
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus est nisl, facilisis id ante ut, auctor venenatis ipsum. Proin rutrum ante eu ligula mollis, quis accumsan ex volutpat. Praesent sit amet viverra tellus, sit amet accumsan eros. Praesent magna magna, porttitor in pretium ut, efficitur eu eros. Suspendisse tortor nibh, consequat vel commodo sit amet, lacinia in mauris. Aenean semper tempus ornare. Donec cursus, nulla eget feugiat hendrerit, elit ipsum viverra purus, a luctus sapien leo vel eros. Donec dapibus lobortis mattis.',
			'Donec placerat dui vel tellus iaculis, id lacinia nibh pharetra. Quisque ultricies elementum eros. Praesent rhoncus sed ex nec aliquet. Nullam eget tellus consectetur, tempus metus ac, scelerisque nunc. Cras ullamcorper molestie nulla, a scelerisque purus vulputate eget. Donec vel arcu semper nunc sagittis feugiat dignissim vitae odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent iaculis maximus orci, nec rhoncus felis gravida quis. Aenean consequat urna porttitor, maximus libero vitae, ultrices turpis. Aliquam sapien eros, vestibulum eu elit nec, blandit auctor ante. Fusce odio ligula, pulvinar quis pharetra id, euismod in ligula.',
			'Cras blandit placerat placerat. Quisque euismod ligula ante, eget faucibus odio ultricies et. Proin condimentum suscipit dictum. Sed mattis id massa eu vestibulum. Cras vitae lobortis nisi. Vivamus maximus tortor id tellus pharetra lobortis. Curabitur sed erat et quam viverra porta. Fusce elementum ante accumsan, volutpat diam in, auctor mi. Fusce bibendum sollicitudin dolor non venenatis. Quisque sapien justo, malesuada ut dui at, pharetra egestas est. Nulla sed sem at eros vehicula suscipit.',
			'Vivamus semper in sem eget eleifend. Aenean vel nisl eget turpis auctor eleifend. Quisque ut finibus nisl. Praesent sapien lacus, dignissim non dictum sit amet, porttitor eget arcu. Sed orci erat, blandit eget lorem ut, pulvinar scelerisque augue. Phasellus luctus quam vitae faucibus feugiat. Praesent quis hendrerit mi, eu porttitor odio. Donec nec egestas sapien. Suspendisse aliquam enim eu eros volutpat fringilla. Maecenas sit amet gravida ante, quis rhoncus orci. Morbi sollicitudin porta augue id viverra.',
			'Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer in tristique risus. Nullam dignissim fermentum euismod. Sed nec eros massa. Fusce pellentesque nibh id pellentesque porta. Suspendisse condimentum risus sit amet tellus gravida dictum. Curabitur laoreet condimentum massa congue scelerisque. Sed a finibus neque. Curabitur rhoncus vitae dolor nec viverra. Vivamus vel suscipit ligula. Suspendisse aliquet pellentesque augue, at semper arcu aliquam non. Nunc scelerisque lorem diam, nec faucibus ipsum posuere id. Integer aliquet nisi id magna facilisis consectetur. Quisque sit amet rhoncus nisi. Nulla interdum nec risus et porttitor.'
		];
	}
	
	$scope.getRandomText = function(){
		return $scope.ipsums[Math.floor(Math.random() * ($scope.ipsums.length))];
	};
	
	$scope.getDate = function(withTime){
		var date = new Date();
		if(!withTime)
			return date.toJSON().slice(0,10);
		else{
			var hour    = date.getHours();
			var minute  = date.getMinutes();
			var second  = date.getSeconds(); 
			
			if(hour.toString().length == 1) {
				hour = '0'+hour;
			}
			if(minute.toString().length == 1) {
				minute = '0'+minute;
			}
			if(second.toString().length == 1) {
				second = '0'+second;
			}   
			var dateTime = date.toJSON().slice(0,10) +' '+hour+':'+minute+':'+second;   
         
			return dateTime;
		}
	};
	
	$scope.getRandomNumber = function() {
		return Math.floor(Math.random() * 100);
	};
	
	function getTemplatesList(kbId){
		var ga = new GlideAjax('ArticleTemplateUtil');
		ga.addParam('sysparm_name', 'getTemplatesDataForKB');
		ga.addParam('sysparm_kbid', kbId);
		
		ga.getXMLAnswer(function(answer){
			var response = answer.evalJSON(true);
			if(response.kb == $scope.selectedKB){
				$scope.templatesList = Object.keys(response.templates).map(function(template){
					return {
						name: response.templates[template],
						value: template
					};
				});
				if($scope.autoselectedTemplate) {
					var updatedTemplateList = $scope.templatesList.filter(function(item) {
    				return item.value === $scope.autoselectedTemplate;
				});
				$scope.templatesList = updatedTemplateList;
				$scope.selectTemplate($scope.autoselectedTemplate);
				}
				$scope.templatesLoading = false;
				$scope.templatesListPresent = true;
				$scope.templatesEmpty = $scope.templatesList.length === 0;
				$scope.$apply();
			}
		});
	}
	
	function getTemplateFields(template) {
		var ga = new GlideAjax('ArticleTemplateUtil');
		ga.addParam('sysparm_name', 'getFieldsForTemplate');
		ga.addParam('sysparm_template', template);
		
		ga.getXMLAnswer(function(answer){
			var response = answer.evalJSON(true);
			if(response.template == $scope.selectedTemplate){
				$scope.fields = response.fields;
				$scope.previewLoading = false;
				
				for(var i=0;i<$scope.fields.length;i++){
					$scope.fields[i].preview_text = $sce.trustAsHtml($scope.fields[i].preview_text);
				}
				$scope.$apply();
			}
		});
	}
	
	$scope.selectTemplate = function(template){
		if(template === $scope.selectedTemplate){
			$scope.deselect('kb_article_template');
		}
		else {
			if(!$scope.templatesLoading){
				$scope.selectedTemplate = template;
				$scope.previewLoading = true;
				getTemplateFields(template);
			}
		}
	};
	
	$scope.selectKB = function(kb){
		$scope.selectedTemplate = '';
		if(kb === $scope.selectedKB){
			$scope.deselect('kb_knowledge_base');
		}
		else{
			$scope.selectedKB = kb;
			$scope.fields = [];
			$scope.templatesLoading = true;
			$scope.templatesEmpty = false;
			$scope.templatesListPresent = false;
			getTemplatesList($scope.selectedKB);
		}
	};
	
	$scope.clearSearch = function(id){
		$scope[id] = '';
	};
	
	$scope.toggleSection = function(field){
		field.collapsed = !field.collapsed;
		$j('#'+field.column).slideToggle("fast");
	};
	
	$scope.deselect = function(id){
		if(id === 'kb_knowledge_base') {
			$scope.selectedKB = '';
			$scope.templatesList = [];
			$scope.kb_article_template = '';
			$scope.selectedTemplate = '';
			$scope.templatesListPresent = false;
			$scope.templatesEmpty = false;
			$scope.fields = [];
		}
		else {
			$scope.selectedTemplate = '';
			$scope.fields = [];
		}
	};
	
	function generateQuery(query) {
		if(query.indexOf('sysparm_query') != -1){
			var sysQuery = query.split('sysparm_query=')[1].split('&')[0];
			if(sysQuery) {
				var newQuery;
				if(sysQuery.indexOf('kb_knowledge_base') != -1){
					newQuery = sysQuery.split('^').map(function(condition){
						if(condition.indexOf('kb_knowledge_base') != -1){
							condition = 'kb_knowledge_base=' + $scope.selectedKB;
						}
						return condition;
					}).join('^');
					newQuery = encodeURIComponent(newQuery);
				}
				else {
					newQuery = encodeURIComponent('kb_knowledge_base=' + $scope.selectedKB + '^' + decodeURIComponent(sysQuery));
				}
				return query.replace(sysQuery, newQuery);
			}
		}		
		var sysIdIndex1 = query.indexOf('?sys_id');
		var sysIdIndex2 = query.indexOf('&sys_id');
		if (sysIdIndex1 == -1 && sysIdIndex2 == -1)
			query += '&sys_id=-1';
		else {
			var temp = sysIdIndex1 > -1 ? '?sys_id=-1' : '&sys_id=-1';
			if (query.indexOf(temp) == -1) {
				var tempQuery = query.split('&').map(function(str) {
					if (/^\?sys_id/.test(str)) {
						str = temp;
					} else if (/^sys_id/.test(str)) {
						str = 'sys_id=-1';
					}
					return str;
				}).join('&');
				query = tempQuery;
			}
		}
		return query + '&sysparm_query=' + encodeURIComponent('kb_knowledge_base=' + $scope.selectedKB + '^EQ');
	}
	
	$scope.createArticle = function(template,kb){
		var query = location.search;
		var sysparmCollection  = "$[JS:RP.getParameterValue('sysparm_collection')]";
		var sysparmCollectionID  = "$[JS:RP.getParameterValue('sysparm_collectionID')]";
		if(query) {
			if(sysparmCollection && sysparmCollectionID && sysparmCollection=='kb_knowledge_base') {
				query= query.replace('sysparm_collectionID='+sysparmCollectionID,'');
			} 
			
			if($scope.sourceId && $scope.sourceTable) {
				getEncodedQueryFromCSMmap(query);
			} else{
				url = '/' +  $scope.selectedTemplate + '.do' + generateQuery(query);
				window.location.href = url;
			}
				
		} else {
			url = '/' +  $scope.selectedTemplate + '.do?sys_id=-1&sysparm_query=' + encodeURIComponent('active=true^kb_knowledge_base=' + $scope.selectedKB + '^EQ');
			window.location.href = url;
		}
	};

	function getEncodedQueryFromCSMmap(query) {
		var ga = new GlideAjax('KBAjax');
		ga.addParam('sysparm_type', 'buildInputFromParams');
		ga.addParam('sysparm_sourceId',  $scope.sourceId);
		ga.addParam('sysparm_source',  $scope.sourceTable);
		ga.addParam('sysparm_target',  $scope.selectedTemplate);
		ga.addParam('sysparm_knowledgeBase',  $scope.selectedKB);
		ga.getXMLAnswer(function(answer){
			url = '/' + $scope.selectedTemplate + '.do' + query + '&sysparm_query=' + encodeURIComponent('active=true' + '^' + answer + '^EQ');
            window.location.href = url;
		});

	};
});
