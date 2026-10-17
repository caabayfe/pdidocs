var CILandingPageCTACardsProcessor = Class.create();
CILandingPageCTACardsProcessor.prototype = {
    initialize: function() {
        this.VAPlugin = "com.glide.cs.chatbot";
        this.portalConfigs = [];
        this.portals = [];
        this.getPortals();
        this.data = [{
                "section_title": gs.getMessage("Get the essentials set up for your Virtual Agent."),
                "cards": [{
                        "screens": [{
                                "screen_type": "content",
                                "title": gs.getMessage("Choose where it will live"),
                                "description": gs.getMessage("Give your users a place to go to interact with your bot until you add it to other channels (like Slack or Teams)."),
                                "heading": gs.getMessage("Integrate your bot with a portal"),
                                "image_src": "/images/ci_landingexp_portals.png",
                                "pluginId": "",
                                "actions": [{
                                    "label": gs.getMessage("Add to portal"),
                                    "icon": "",
                                    "link": "/sp_agent_chat_config.do?sys_id=-1",
                                    "external": true,
                                    "items": this.portalConfigs

                                }]
                            },
                            {
                                "screen_type": "content",
                                "title": gs.getMessage("Choose where your bot will live"),
                                "heading": gs.getMessage("See your bot in action"),
                                "description": gs.getMessage("Open your portal and see how users will interact with the bot and topics specific to the portal."),
                                "image_src": "/images/ci_landingexp_portals.png",
                                "pluginId": "",
                                "actions": [{
                                    "label": gs.getMessage("Open portal"),
                                    "icon": "",
                                    "link": "",
                                    "items": this.portals
                                }]
                            }
                        ]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Customize your bot"),
                            "heading": gs.getMessage("Edit your bot's look and feel"),
                            "description": gs.getMessage("Edit the bot's colors and logo to reflect a branded experience that is customized to your company's portal."),
                            "image_src": "/images/ci_landingexp_branding.png",
                            "pluginId": "",
                            "actions": [{
                                "label": gs.getMessage("Set up branding"),
                                "icon": "",
                                "link": "sys_cs_branding_setup",
                                "params": {},
                                "external": false
                            }]
                        }]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Customize your bot"),
                            "heading": gs.getMessage("Choose how your bot greets users"),
                            "description": gs.getMessage("Build confidence by using greetings that are customized to each user. You can also let users search for something if the bot can't help them out."),
                            "image_src": "/images/ci_landingexp_greetings.png",
                            "pluginId": "",
                            "actions": [{
                                "label": gs.getMessage("Set up greetings"),
                                "icon": "",
                                "link": "sys_cs_context_profile",
                                "params": {
                                    "view": "simple_chat_context_profiles"
                                },
                                "external": false
                            }]
                        }]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Help your bot better understand users"),
                            "heading": gs.getMessage("Collect interaction metrics"),
                            "description": gs.getMessage("Review conversational data (like how often users resolve their requests) to get insights on what topics can be improved."),
                            "image_src": "/images/ci_landingexp_va_analytics.png",
                            "pluginId": "sn_ci_analytics",
                            "actions": [],
                            "before_plugin_install": {
                                "label": gs.getMessage("Get VA Analytics plugin"),
                                "icon": "open-link-right-outline",
                                "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c53ca02a73c310108564b17afef6a7c0",
                                "external": true
                            },
                            "after_plugin_install": {
                                "description": gs.getMessage("You can view and compare metrics (like how often users resolve their requests) to optimize your bot's performance. Then, you can use the data to find out where you can improve your implementation."),
                                "label": gs.getMessage("Go to VA Analytics"),
                                "icon": "open-link-right-outline",
                                "link": "/now/conversation/analytics/home",
                                "external": true
                            }
                        }]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Choose where your bot will live"),
                            "heading": gs.getMessage("Add your bot to other channels"),
                            "description": gs.getMessage("Connect to other channels (like Slack or MS Teams) so your users have more ways to access your bot."),
                            "image_src": "/images/ci_landingexp_channels.png",
                            "pluginId": "",
                            "actions": [{
                                "label": gs.getMessage("Set up channels"),
                                "icon": "",
                                "link": "/nav_to.do?uri=%2F$bot-install-ui.do?sysparm_userpref_module=362567aa731313004a905ee515f6a783&sysparm_clear_stack=true",
                                "external": true
                            }]
                        }]
                    },
                    {
                        "screens": [{
                                "screen_type": "links",
                                "title": gs.getMessage("Teach your bot to handle requests"),
                                "heading": gs.getMessage("Choose what type of requests you want your bot to support"),
                                "description": gs.getMessage("Select a plugin to get prebuilt topics that can handle your users' requests."),
                                "links": [],
                                "links_data": [{
                                        "label": gs.getMessage("Get ITSM plugin"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/134450a0b3781300787162ac16a8dc1e",
                                        "pluginId": "com.snc.itsm.virtualagent"
                                    },
                                    {
                                        "label": gs.getMessage("Get CSM plugin"),
                                        "icon": "open-link-right-outline",
                                        "url": "/nav_to.do?uri=%2F$allappsmgmt.do%3Fsysparm_search%3Dcom.sn_csm.virtualagent",
                                        "pluginId": "com.sn_csm.virtualagent"
                                    },
                                    {
                                        "label": gs.getMessage("Get HR plugin"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c8c5545573d8130000e588e54cf6a71a",
                                        "pluginId": "com.sn_hr_virtual_agent"
                                    },
                                    {
                                        "label": gs.getMessage("See other plugins in Store"),
                                        "icon": "open-link-right-outline",
                                        "url": "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=virtual%20agent%26sysparm_filter=Obtained=not_installed",
                                        "pluginId": ""
                                    }
                                ]
                            },
                            {
                                "screen_type": "links",
                                "title": gs.getMessage("Teach your bot to handle requests"),
                                "heading": gs.getMessage("Here are some additional plugins"),
                                "description": gs.getMessage("Select a plugin to get prebuilt topics that can handle your users' requests."),
                                "links": [],
                                "links_data": [{
                                        "label": gs.getMessage("Field Service Virtual Agent Conversations"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/b7d7aa2ab7ae10105f48228dce11a9d5",
                                        "pluginId": "com.sn_fsm.virtualagent"
                                    },
                                    {
                                        "label": gs.getMessage("Virtual Agent for PPM"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/1fc89d065321101023beddeeff7b123c",
                                        "pluginId": "com.snc.ppm_virtualagent"
                                    },
                                    {
                                        "label": gs.getMessage("Legal Virtual Agent Conversations"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/432a0027dc231010fa9bd014d30fd954",
                                        "pluginId": "com.sn_lg_virtual_agent"
                                    },
                                    {
                                        "label": gs.getMessage("GRC: Virtual Agent"),
                                        "icon": "open-link-right-outline",
                                        "url": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/e00c596e539333004714ddeeff7b1208",
                                        "pluginId": "com.sn_grc_virt_agent"
                                    },
                                    {
                                        "label": gs.getMessage("ISC Virtual Agent Conversations"),
                                        "icon": "open-link-right-outline",
                                        "url": "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.glide.isc_virtualagent",
                                        "pluginId": "com.glide.isc_virtualagent"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Teach your bot to handle requests"),
                            "heading": gs.getMessage("Get recommended topics"),
                            "description": gs.getMessage("With Topic Recommendations, we'll recommend prebuilt topics for your bot by analyzing your existing support requests."),
                            "image_src": "/images/ci_landingexp_topicrecommendations.png",
                            "pluginId": "com.snc.va_topic_recommender",
                            "actions": [],
                            "before_plugin_install": {
                                "label": gs.getMessage("Get Topic Recommendations plugin"),
                                "icon": "open-link-right-outline",
                                "link": "https://store.servicenow.com/sn_appstore_store.do#!/store/application/87c995fd53d21010a813ddeeff7b12e1",
                                "external": true
                            },
                            "after_plugin_install": {
                                "label": gs.getMessage("Go to Topic Recommendations"),
                                "icon": "open-link-right-outline",
                                "link": "/nav_to.do?uri=%2F$topic-recommender.do%23%2Freports",
                                "external": true
                            }
                        }]
                    }
                ]
            },
            {
                "section_title": gs.getMessage("Continue growing your chat experience."),
                "cards": [{
                        "screens": [{
                                "screen_type": "content",
                                "title": gs.getMessage("Help your bot better understand users"),
                                "heading": gs.getMessage("Set up your NLU"),
                                "description": gs.getMessage("Natural Language Understanding (NLU) is a powerful way to understand what your users are saying and to connect them to the right topic. You will need to choose a NLU service provider to integrate with to turn this on."),
                                "image_src": "/images/ci_landingexp_nlu.png",
                                "pluginId": "",
                                "actions": [{
                                    "label": gs.getMessage("View NLU settings"),
                                    "icon": "",
                                    "route": "nlu-setting",
                                    "params": {},
                                    "external": false
                                }]
                            },
                            {
                                "screen_type": "content",
                                "title": gs.getMessage("Help your bot better understand users"),
                                "heading": gs.getMessage("Improve your NLU models"),
                                "description": gs.getMessage("Improve how your NLU models predict intents by filling in what users want, what they might say, and what terms they use."),
                                "image_src": "/images/ci_landingexp_nlu.png",
                                "pluginId": "",
                                "actions": [{
                                    "label": gs.getMessage("Go to NLU Workbench"),
                                    "icon": "open-link-right-outline",
                                    "link": "/nav_to.do?uri=%2F$nlu-studio.do%23%2Fmodels",
                                    "external": true
                                }]
                            },
                            {
                                "screen_type": "content",
                                "title": gs.getMessage("Help your bot better understand users"),
                                "heading": gs.getMessage("Set up NLU Advanced Features"),
                                "description": gs.getMessage("Expand the functionality of your NLU Workbench to manage and improve your models."),
                                "image_src": "/images/ci_landingexp_nlu.png",
                                "pluginId": "com.glide.nlu",
                                "actions": [],
                                "before_plugin_install": {
                                    "label": gs.getMessage("Get this plugin"),
                                    "icon": "open-link-right-outline",
                                    "link": "/nav_to.do?uri=$allappsmgmt.do%3Fsysparm_search%3Dcom.glide.nlu",
                                    "external": true
                                },
                                "after_plugin_install": {}
                            }
                        ]
                    },
                    {
                        "screens": [{
                            "screen_type": "content",
                            "title": gs.getMessage("Help your bot better understand users"),
                            "heading": gs.getMessage("Set up Issue Auto Resolution "),
                            "description": gs.getMessage("Issue Auto Resolution (IAR) allows a bot to initiate a conversation with a user after they submit a request through a non-conversational channel (like email or a portal)."),
                            "image_src": "/images/ci_landingexp_iar.png",
                            "pluginId": "com.glide.cs.auto_resolution",
                            "actions": [],
                            "before_plugin_install": {
                                "label": gs.getMessage("Get this plugin"),
                                "icon": "open-link-right-outline",
                                "link": "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.glide.cs.auto_resolution",
                                "external": true
                            },
                            "after_plugin_install": {
                                "description": gs.getMessage("You can configure the settings to determine when a bot will initiate a conversation with a user who has submitted a request through a non-conversational channel (like email or a portal)."),
                                "label": gs.getMessage("View IAR settings"),
                                "icon": "",
                                "link": "sys_cs_auto_resolution_configuration",
                                "params": {},
                                "external": false
                            }
                        }]
                    },
                    {
                        "screens": [{
                                "screen_type": "content",
                                "title": gs.getMessage("Help your bot better understand users"),
                                "heading": gs.getMessage("Set up Agent Chat"),
                                "description": gs.getMessage("Agent Chat is a way to offer live chat support from human agents directly in the chat client. Users can ask questions, and agents can respond to users and file incident or case records."),
                                "image_src": "/images/ci_landingexp_agentchat.png",
                                "pluginId": "com.glide.interaction.awa",
                                "actions": [],
                                "before_plugin_install": {
                                    "label": gs.getMessage("Get this plugin"),
                                    "icon": "open-link-right-outline",
                                    "link": "/nav_to.do?uri=$allappsmgmt.do?sysparm_search=com.glide.interaction.awa",
                                    "external": true
                                },
                                "after_plugin_install": {
                                    "description": gs.getMessage("You can configure the Agent Chat settings to connect users to live chat support in the chat client."),
                                    "label": gs.getMessage("View Agent Chat settings"),
                                    "icon": "",
                                    "route": "agent-chat",
                                    "params": {},
                                    "external": false
                                }
                            },
                            {
                                "screen_type": "content",
                                "title": gs.getMessage("Help your bot better understand users"),
                                "heading": gs.getMessage("Set up Advanced Work Assignment"),
                                "description": gs.getMessage("Advanced Work Assignment (AWA) allows you to automatically assign work items to agents based on their availability, capacity, and skills."),
                                "image_src": "/images/ci_landingexp_awa.png",
                                "pluginId": "com.glide.awa",
                                "actions": [],
                                "before_plugin_install": {
                                    "label": gs.getMessage("Get this plugin"),
                                    "icon": "open-link-right-outline",
                                    "link": "/nav_to.do?uri=%2F$allappsmgmt.do%3Fsysparm_search%3Dcom.glide.awa",
                                    "external": true
                                },
                                "after_plugin_install": {
                                    "description": gs.getMessage("You can configure the Advanced Work Assignment (AWA) settings to automatically assign work items to agents based on their availability, capacity, and skills."),
                                    "label": gs.getMessage("View AWA settings"),
                                    "icon": "",
                                    "link": "/nav_to.do?uri=%2Fawa_service_channel_list.do%3Fsysparm_userpref_module%3D362567aa731313004a905ee515f6a783%26sysparm_clear_stack%3Dtrue",
                                    "external": true
                                }
                            }
                        ]
                    }
                ]
            }
        ];
    },

    getPortals: function() {
        var gr = new GlideRecord('sp_agent_chat_config');
        gr.addActiveQuery();
        gr.query();
        var portalIds = [];
        var portalConfigs = [];
        var portals = [];
        while (gr.next()) {
            var portalConfigId = gr.getDisplayValue("sys_id");
            portalConfigs.push({
                id: portalConfigId,
                label: gr.getDisplayValue("name"),
                link: "/sp_agent_chat_config.do?sys_id=" + portalConfigId,
                external: true
            });
            if (gr.getValue('portal')) {
                gr.getValue('portal').split(",").forEach(function(portalId) {
                    if (portalIds.indexOf(portalId) == -1) {
                        portalIds.push(portalId);
                        var portalGR = new GlideRecord('sp_portal');
                        portalGR.get(portalId);
                        var urlSuffix = portalGR.getDisplayValue("url_suffix");
                        portals.push({
                            "id": urlSuffix,
                            "label": portalGR.getDisplayValue("title"),
                            "link": "/" + urlSuffix
                        });
                    }
                });
            }

        }
        this.portalConfigs = portalConfigs;
        this.portals = portals;
    },

    getAllCards: function() {
        if (!GlidePluginManager.isActive(this.VAPlugin))
            return [];

        var sections = this.data;
        try {
            sections.forEach(function(section) {
                section.cards.forEach(function(card) {
                    card.screens.forEach(function(screen, index, object) {
                        if (screen['screen_type'] == "links") {
                            screen.links_data.forEach(function(link) {
                                if (link.pluginId == "" || !GlidePluginManager.isActive(link.pluginId)) {
                                    screen.links.push(link);
                                }
                            });
                            if (screen.links.length == 0)
                                object.splice(index, 1);
                        }
                        if (screen["pluginId"]) {
                            var insMeta;
                            if (GlidePluginManager.isActive(screen["pluginId"])) {
                                insMeta = screen["after_plugin_install"];
                                if (!insMeta)
                                    object.splice(index, 1);
                            } else {
                                insMeta = screen["before_plugin_install"];
                            }
                            if (insMeta) {
                                screen.description = insMeta.description || screen.description;
                                screen["actions"].push({
                                    link: insMeta.link,
                                    label: insMeta.label,
                                    icon: insMeta.icon,
                                    route: insMeta.route,
                                    external: insMeta.external
                                });
                            }

                        }

                    });

                });

            });

        } catch (err) {
            return {
                "message": err.message
            };
        }
        return sections;
    },

    type: 'CILandingPageCTACardsProcessor'
};
