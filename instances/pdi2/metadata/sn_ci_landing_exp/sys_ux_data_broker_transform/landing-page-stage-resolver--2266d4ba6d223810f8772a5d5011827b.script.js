function transform() {

    function getPortals() {
        var items = [];
        try {
            var gr = new GlideRecord('sp_portal');
            gr.addActiveQuery();
            gr.query();
            while (gr.next()) {
                var settings_label = gs.getMessage("View settings");
                var urlSuffix = gr.getDisplayValue("url_suffix");
                var sys_id = gr.getUniqueValue();
                var agentChatGR = new GlideRecord('sp_agent_chat_config');
                agentChatGR.addQuery("portal=" + sys_id);
                agentChatGR.query();
                var settings_link = "/sp_agent_chat_config.do?sys_id=";
                var isActive = "false";
                if (agentChatGR.next()) {
                    settings_link += agentChatGR.getUniqueValue();
                    isActive = agentChatGR.getDisplayValue("active");
                    if (isActive == "false") {
                        settings_label = gs.getMessage("Set up bot integration");
                    }
                    items.push({
                        "id": urlSuffix,
                        "label": gr.getDisplayValue("title"),
                        "portal_link": "/" + urlSuffix,
                        "settings_link": settings_link,
                        "isActive": isActive,
                        "settings_label": settings_label
                    });
                }
            }
        } catch (e) {

        }
        return items;
    }

    function getActiveTopics() {
        var _count = 0;
        if (GlidePluginManager.isActive("com.glide.cs.chatbot") || GlidePluginManager.isActive("com.glide.cs.chatbot.lite")) {
            var gr = new GlideAggregate('sys_cs_topic');
            gr.addQuery("is_system_topic", false);
            gr.addQuery("type", "!=", "TOPIC_BLOCK");
            gr.addQuery("type", "!=", "SETUP_TOPIC");
            gr.addQuery("active", true);
            gr.addAggregate("COUNT");
            gr.query();
            _count = gr.next() ? gr.getAggregate('COUNT') : 0;
        }
        return _count;
    }

    function processData() {
        advancedStageData["right_nav_links"].forEach(function(rightnavData) {
            if (rightnavData["pluginId"] && rightnavData["pluginId"] != "") {
                if (GlidePluginManager.isActive(rightnavData["pluginId"])) {
                    rightnavData["actions"] = rightnavData["after_install"];
                } else
                    rightnavData["actions"] = rightnavData["before_install"];
            }
        });
    }

    var queAndAnsData = [{
        "Question": gs.getMessage("How do you currently handle incoming user requests?"),
        "Answer": gs.getMessage("You might currently support user requests with agents on the phone or even responding to them via email. You might also have a system in place to track incoming requests. Think about your current support methods and how your company will make the transition as you move to implement a more centralized and automated chat system.")
    }, {
        "Question": gs.getMessage("What type of agents do you want to handle these requests?"),
        "Answer": gs.getMessage("There are two types of agents that can assist with user requests: virtual and human agents. Virtual agents can handle common requests by using prebuilt topics, freeing up your human agents to work on the more complicated requests. Decide if you want to support one or both types of agents in your company.")
    }, {
        "Question": gs.getMessage("Where do you want to offer support to your users?"),
        "Answer": gs.getMessage("You aren't limited to offering support on just one channel. Your virtual and human agents can meet users where they are, like an employee portal or third-party messaging app (like Microsoft Teams). Think about where your users are most likely to need help so you can meet them where they're at.")
    }, {
        "Question": gs.getMessage("What types of information do you have to support your users?"),
        "Answer": gs.getMessage("Users may need different types of information to help solve a particular request. They may need a status update, a method for ordering something, or even step-by-step guidance. Consider setting up a knowledgebase or adding catalog items ahead of time to assist the needs of all users.")
    }, {
        "Question": gs.getMessage("What do you want to achieve by deploying a virtual agent?"),
        "Answer": gs.getMessage("There are many reasons you may want to deploy a virtual agent: to reduce costs, deflect common requests, or offer users a convenient way to get support (self-service or otherwise). Think about what outcomes you want to achieve as you build your virtual agent — this will help you craft one with purpose.")
    }];
    var res = {};
	var active_topics = "";
    if (!GlidePluginManager.isActive("com.glide.cs.chatbot")) {
        res = {
            "stage": "Beginner",
			"active_topics": "View your bot's topics"
        };
    } else {
        active_topics = getActiveTopics();
        var topics_msg = gs.getMessage("See what defaults you have");
        if (active_topics != "0")
            topics_msg = gs.getMessage("{0} active topics", [active_topics]);
        var advancedStageData = {
        "stage": "Advanced",
        "title": gs.getMessage("Now, see your bot in action on a portal"),
        "description": gs.getMessage("Select which portal to integrate with your bot. If you've already integrated them, you can open that portal to see a working version of your bot."),
        "select_label": gs.getMessage("Select a portal"),
        "open_label": gs.getMessage("Open portal"),
        "portals": getPortals(),
        "active_topics": topics_msg,
        "right_nav_title": gs.getMessage("Keep improving your bot"),
        "right_nav_links": [{
                "title": gs.getMessage("Refine and test topics"),
                "tooltip": gs.getMessage(""),
                "actions": {
                    "link_text": gs.getMessage("Go to VA Designer"),
                    "link_url": "/$conversation-builder.do"
                }
            },
            {
                "title": gs.getMessage("Get suggestions for topics"),
                "tooltip": gs.getMessage(""),
                "pluginId": "com.snc.va_topic_recommender",
                "actions": {},
                "before_install": {
                    "link_text": gs.getMessage("Run Topic Recommendations"),
                    "link_url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/87c995fd53d21010a813ddeeff7b12e1",
                },
                "after_install": {
                    "link_text": gs.getMessage("View Recommended Topics"),
                    "link_url": "/nav_to.do?uri=%2F$topic-recommender.do%23%2Freports",
                }
            },
            {
                "title": gs.getMessage("Analyze your bot's performance"),
                "tooltip": gs.getMessage(""),
                "actions": {},
                "pluginId": "sn_ci_analytics",
                "before_install": {
                    "link_text": gs.getMessage("Get VA Analytics plugin"),
                    "link_url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c53ca02a73c310108564b17afef6a7c0",
                },
                "after_install": {
                    "link_text": gs.getMessage("Go to VA Analytics"),
                    "link_url": "/now/conversation/analytics/home"
                }
            }
        ]
    };

        if (GlidePluginManager.isActive("com.snc.itsm.virtualagent") || GlidePluginManager.isActive("com.sn_csm.virtualagent") || GlidePluginManager.isActive("com.sn_hr_virtual_agent") || GlidePluginManager.isActive("com.sn_fsm.virtualagent") || GlidePluginManager.isActive("com.snc.ppm_virtualagent") || GlidePluginManager.isActive("com.sn_lg_virtual_agent") || GlidePluginManager.isActive("com.sn_grc_virt_agent") || GlidePluginManager.isActive("com.glide.isc_virtualagent")) {
            processData();
            res = advancedStageData;
        } else {
            res = {
                "stage": "Exploration",
                "active_topics": topics_msg
            };
        }
    }
    res["que_and_ans"] = queAndAnsData;
    res["more"] = gs.getMessage("See more");
    res["less"] = gs.getMessage("Show less");
    res["topics_content"] = gs.getMessage("Try your bot");
	res["refresh_console"] = gs.getMessage("Refresh console");
	res["isChatbotLiteInstalled"] = GlidePluginManager.isActive("com.glide.cs.chatbot.lite");
    res["isChatbotInstalled"] = GlidePluginManager.isActive("com.glide.cs.chatbot");
	return res;


}
