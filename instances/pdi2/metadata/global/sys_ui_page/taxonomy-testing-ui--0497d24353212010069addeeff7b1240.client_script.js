var app = angular.module('testingUI', []);
app.controller('testingUICtrl', function($scope) {
    $scope.selectedApi = "Taxonomy";
    $scope.apiList = ["Taxonomy", "Topic"];
    $scope.outputObject = {
        isStringResponse: false,
        hasNoResponse: false,
        isTopicResponse: false,
        topics: [],
        isContentResponse: false,
        contentItems: [],
        isFeatureContentResponse: true,
        featuredContentItems: [],
        stringResponse: ""
    };
    $scope.inputObject = {
        "taxonomyId": "",
        "topicId": ""
    };

    var url_string = window.location.href;
    var url = new URL(url_string);
    $scope.inputObject.taxonomyId = url.searchParams.get("taxonomyId");
    $scope.inputObject.topicId = url.searchParams.get("topicId");

    $scope.selectedApi = $scope.inputObject.taxonomyId ? "Taxonomy" : "Topic";

    $scope.taxonomyApis = [{
            "name": "getRootTopicIds()",
            "params": "",
            "func": "getRootTopicIdsOfTaxonomy"
        }, {
            "name": "getTopics(hideTopicWithNoContent, maxLevel, isMobile)",
            "params": "true,2,false",
            "func": "getTopicsOfTaxonomy"
        },
        {
            "name": "getTopicsHierarchy()",
            "params": "",
            "func": "getTopicsHierarchy"
        },
        {
            "name": "getAllTaxonomies()",
            "params": "",
            "func": "getAllTaxonomies"
        }
    ];
    $scope.topicApis = [{
            "name": "canView(isMobile)",
            "params": "false",
            "func": "canViewTopic"
        }, {
            "name": "getChildTopicIds(includeChildTopics)",
            "params": "false",
            "func": "getChildTopicIdsOfTopic"
        }, {
            "name": "getChildTopics(hideTopicWithNoContent, isMobile, limit, offset)",
            "params": "true, false, 5, 0",
            "func": "getChildTopicsOfTopic"
        },
        {
            "name": "getSiblingTopics(hideTopicWithNoContent, isMobile, limit, offset)",
            "params": "false, false, 5, 0",
            "func": "getSiblingTopicsOfTopic"
        },
        {
            "name": "getContent(includeChildTopics, limit, isMobile, excludeItems, contentConfigId)",
            "params": "true,5,false,[\"1234\", \"1235\"],[\"4c32a92153622010069addeeff7b12a3\",\"98f9a16553622010069addeeff7b1248\"]",
            "func": "getContent"
        },
        {
            "name": "getContentByPopularity(includeChildTopics, limit, isMobile, excludeItems, contentConfigId)",
            "params": "true,5,false,[\"1234\", \"1235\"],[\"4c32a92153622010069addeeff7b12a3\",\"98f9a16553622010069addeeff7b1248\"]",
            "func": "getContentByPopularity"
        },
        {
            "name": "getFeaturedContent(limit, isMobile, contentConfigId)",
            "params": "2,false,[\"4c32a92153622010069addeeff7b12a3\",\"98f9a16553622010069addeeff7b1248\"]",
            "func": "getFeaturedContent"
        },
        {
            "name": "createContentMapping(contentSysId, contentTable, topicSysId)",
            "params": "",
            "func": "createContentMapping"
        }
    ];

    $scope.getRootTopicIdsOfTaxonomy = function(params) {
        var inputs = {};
        inputs["taxonomyId"] = $scope.inputObject.taxonomyId;
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getRootTopicIdsOfTaxonomy');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getTopicsOfTaxonomy = function(params) {
        var parseParams = params.split(",");
        var inputs = {};
        inputs["taxonomyId"] = $scope.inputObject.taxonomyId;
        inputs["hideTopicsWithNoCotent"] = parseParams[0] && parseParams[0].trim() == "true";
        if (parseParams[1])
            inputs["maxLevel"] = parseInt(parseParams[1].trim());
        else
            inputs["maxLevel"] = 0;
        inputs["isMobile"] = parseParams[2] && parseParams[2].trim() == "true";
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getTopicsOfTaxonomy');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.canViewTopic = function(params) {
        var parseParams = params.split(",");
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["isMobile"] = parseParams[0] && parseParams[0].trim() == "true";
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'canViewTopic');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getChildTopicIdsOfTopic = function(params) {
        var parseParams = params.split(",");
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["includeChildTopics"] = parseParams[0] && parseParams[0].trim() == "true";
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getChildTopicIdsOfTopic');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getChildTopicsOfTopic = function(params) {
        var parseParams = params.split(",");
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["hideTopicsWithNoCotent"] = parseParams[0] && parseParams[0].trim() == "true";
        inputs["isMobile"] = parseParams[1] && parseParams[1].trim() == "true";
        inputs["limit"] = parseParams[2] || "5";
        inputs["offset"] = parseParams[3] || "0";
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getChildTopicsOfTopic');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getTopicsHierarchy = function(params) {
        var ga = new GlideAjax('ContentAuthoringAjax');
        ga.addParam('sysparm_name', 'getTaxonomyTopics');
        ga.addParam('sysparm_taxonomyId', $scope.inputObject.taxonomyId);
        ga.getXML($scope.handleAuthoringResponse);
    };

    $scope.getAllTaxonomies = function() {
        var ga = new GlideAjax('ContentAuthoringAjax');
        ga.addParam('sysparm_name', 'getTaxonomies');
        ga.getXML($scope.handleAuthoringResponse);
    };

    $scope.getContent = function() {
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["includeChildren"] = $scope.inputObject.includeChildren;
        inputs["isMobile"] = $scope.inputObject.isMobile;
        inputs["limit"] = $scope.inputObject.contentLimit;
        inputs["contentConfigId"] = JSON.stringify($scope.inputObject.contentConfigId);
        if ($scope.outputObject.contentItems.length > 0) {
            var items = $scope.outputObject.contentItems;
            for (var i = 0; i < items.length; i++) {
                $scope.inputObject.excludeItems.push(items[i].content);
            }
        }
        inputs["excludeItems"] = JSON.stringify($scope.inputObject.excludeItems);
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getContent');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getContentByPopularity = function() {
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["includeChildren"] = $scope.inputObject.includeChildren;
        inputs["isMobile"] = $scope.inputObject.isMobile;
        inputs["limit"] = $scope.inputObject.contentLimit;
        inputs["contentConfigId"] = JSON.stringify($scope.inputObject.contentConfigId);
        if ($scope.outputObject.contentItems.length > 0) {
            var items = $scope.outputObject.contentItems;
            for (var i = 0; i < items.length; i++) {
                $scope.inputObject.excludeItems.push(items[i].content);
            }
        }
        inputs["excludeItems"] = JSON.stringify($scope.inputObject.excludeItems);
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getContentByPopularity');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.getFeaturedContent = function() {
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["limit"] = $scope.inputObject.featuredContentLimit;
        inputs["isMobile"] = $scope.inputObject.isMobile;
        inputs["contentConfigId"] = JSON.stringify($scope.inputObject.contentConfigId);
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getFeaturedContent');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.createContentMapping = function(params) {
        var parseParams = params.split(",");

        for (var i = 0; i < parseParams.length; i++)
            console.log(parseParams[i]);

        var ga = new GlideAjax('ContentAuthoringAjax');
        ga.addParam('sysparm_name', 'createContentMapping');
        ga.addParam("sysparm_documentId", parseParams[0]);
        ga.addParam("sysparm_table", parseParams[1]);
        if (parseParams[2] != undefined)
            ga.addParam("sysparm_topic", parseParams[2]);
        else
            ga.addParam("sysparm_topic", $scope.inputObject.topicId);
        ga.getXML($scope.handleCreateContentMappingResponse);
    };

    $scope.handleCreateContentMappingResponse = function(response) {
        var answer = response.responseXML.documentElement.children[0].getAttribute("mappingSysId");

        var parsedAns = JSON.parse(answer);

        console.log(JSON.stringify(parsedAns));

        var respElem = document.getElementById("response");
        if (!parsedAns) {
            var noResp = document.createElement("div");
            noResp.innerHTML = "No Output";
            noResp.setAttribute("id", "noOutputResp");
            noResp.style.color = "red";
            respElem.append(noResp);
            return;
        } else {
            var contentCreation = document.createElement("pre");
            contentCreation.innerHTML = JSON.stringify(parsedAns, null, '  ');
            contentCreation.style.color = "green";
            respElem.append(contentCreation)
        }
    };

    $scope.getSiblingTopicsOfTopic = function(params) {
        var parseParams = params.split(",");
        var inputs = {};
        inputs["topicId"] = $scope.inputObject.topicId;
        inputs["hideTopicsWithNoCotent"] = parseParams[0] && parseParams[0].trim() == "true";
        inputs["isMobile"] = parseParams[1] && parseParams[1].trim() == "true";
        inputs["limit"] = parseParams[2] || "5";
        inputs["offset"] = parseParams[3] || "0";
        console.log(inputs);
        var ga = new GlideAjax('TaxonomyTestingUIAjax');
        ga.addParam('sysparm_name', 'getSiblingTopicsOfTopic');
        ga.addParam('sysparm_inputs', JSON.stringify(inputs));
        ga.getXML($scope.handleResponse);
    };

    $scope.callFuncByName = function(name, params) {
        resetUI();
        console.log("Function: " + name + " Params: " + params);

        var parsedParms = [];
        if (name == "getContent") {
            parsedParams = params.split(/,(?![^\(\[]*[\]\)])/);
            $scope.inputObject.includeChildren = parsedParams[0] && parsedParams[0].trim() == "true";
            $scope.inputObject.contentLimit = parsedParams[1];
            $scope.inputObject.isMobile = parsedParams[2] && parsedParams[2].trim() == "true";
            $scope.inputObject.excludeItems = parsedParams[3] ? JSON.parse(parsedParams[3]) : [];
            $scope.inputObject.contentConfigId = parsedParams[4] ? JSON.parse(parsedParams[4]) : [];
            $scope.getContent();
        } else if (name == "getContentByPopularity") {
            parsedParams = params.split(/,(?![^\(\[]*[\]\)])/);
            $scope.inputObject.includeChildren = parsedParams[0] && parsedParams[0].trim() == "true";
            $scope.inputObject.contentLimit = parsedParams[1];
            $scope.inputObject.isMobile = parsedParams[2] && parsedParams[2].trim() == "true";
            $scope.inputObject.excludeItems = parsedParams[3] ? JSON.parse(parsedParams[3]) : [];
            $scope.inputObject.contentConfigId = parsedParams[4] ? JSON.parse(parsedParams[4]) : [];
            $scope.getContentByPopularity();
        } else if (name == "getFeaturedContent") {
            parsedParams = params.split(/,(?![^\(\[]*[\]\)])/);
            $scope.inputObject.featuredContentLimit = parseInt(parsedParams[0]);
            $scope.inputObject.isMobile = parsedParams[1] && parsedParams[1].trim() == "true";
            $scope.inputObject.contentConfigId = parsedParams[2] ? JSON.parse(parsedParams[2]) : [];
            $scope.getFeaturedContent();
        } else
            $scope[name](params);
    };


    $scope.handleResponse = function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var functionName = response.responseXML.documentElement.getAttribute("sysparm_name");

        var parsedAns = JSON.parse(answer);
        console.log(parsedAns);

        if (!parsedAns) {
            $scope.outputObject.hasNoResponse = true;
            $scope.$apply();
            return;
        }

        if (parsedAns && parsedAns.errors.length > 0) {
            addErrorsToDom(parsedAns.errors);
        }

        if (parsedAns && !parsedAns.result) {
            $scope.outputObject.hasNoResponse = true;
            $scope.$apply();
            return;
        }

        if (functionName == "getRootTopicIdsOfTaxonomy") {
            var topicIds = parsedAns["result"];
            $scope.outputObject.hasNoResponse = false;
            $scope.outputObject.isStringResponse = true;
            $scope.outputObject.stringResponse = JSON.stringify(topicIds, null, " ");
        } else if (functionName == "getTopicsOfTaxonomy") {
            var topics = parsedAns["result"];
            addTopicsToDom(topics);
        } else if (functionName == "canViewTopic") {
            var canView = parsedAns["result"];
            $scope.outputObject.hasNoResponse = false;
            $scope.outputObject.isStringResponse = true;
            $scope.outputObject.stringResponse = canView;
        } else if (functionName == "getChildTopicIdsOfTopic") {
            var childTopicIds = parsedAns["result"];
            $scope.outputObject.hasNoResponse = false;
            $scope.outputObject.isStringResponse = true;
            $scope.outputObject.stringResponse = JSON.stringify(childTopicIds, null, " ");
        } else if (functionName == "getChildTopicsOfTopic") {
            var childTopicRes = parsedAns["result"];
            addTopicsToDom(childTopicRes.topics);
        } else if (functionName == "getContent") {
            $scope.outputObject.isContentResponse = true;
            $scope.outputObject.contentItems = $scope.outputObject.contentItems.concat(parsedAns["result"]);
        } else if (functionName == "getContentByPopularity") {
            $scope.outputObject.isContentResponse = true;
            $scope.outputObject.contentItems = $scope.outputObject.contentItems.concat(parsedAns["result"]);
        } else if (functionName == "getFeaturedContent") {
            $scope.outputObject.isFeaturedContentResponse = true;
            $scope.outputObject.featuredContentItems = $scope.outputObject.featuredContentItems.concat(parsedAns["result"]);
        } else if (functionName == "getSiblingTopicsOfTopic") {
            var siblingTopicRes = parsedAns["result"];
            addTopicsToDom(siblingTopicRes.topics);
        }
        var time = parsedAns["time"];
        $scope.$apply();
    };

    $scope.handleAuthoringResponse = function(response) {
        var topicsHierarchy = response.responseXML.documentElement.children[0].getAttribute("topics");
        if (!topicsHierarchy)
            topicsHierarchy = response.responseXML.documentElement.children[0].getAttribute("taxonomy");
        var parsedAns = JSON.parse(topicsHierarchy);
        console.log(parsedAns);
        var respElem = document.getElementById("response");
        if (!parsedAns) {
            $scope.outputObject.hasNoResponse = true;
            return;
        } else {
            $scope.outputObject.isStringResponse = true;
            $scope.outputObject.stringResponse = JSON.stringify(parsedAns, null, '  ');
        }
        $scope.$apply();
    };

    $scope.getOrder = function(row) {
        return parseInt(row.order);
    };

    function addTopicsToDom(topics) {
        console.log(topics);
        $scope.outputObject.isTopicResponse = true;
        $scope.outputObject.topics = topics;
    }

    function addErrorsToDom(errors) {
        var errorEle = document.getElementById("errors");
        errors.forEach(function(key) {
            errorEle.innerHTML += "<p>" + key + "</p>";
        });
    }

    $scope.resetUI = resetUI;

    function resetUI() {
        document.getElementById("errors").innerHTML = "";

        $scope.outputObject = {
            isStringResponse: false,
            hasNoResponse: false,
            isTopicResponse: false,
            topic: [],
            isContentResponse: false,
            contentItems: [],
            isFeaturedContentResponse: false,
            featuredContentItems: [],
            stringResponse: "",
        };
    }
});
