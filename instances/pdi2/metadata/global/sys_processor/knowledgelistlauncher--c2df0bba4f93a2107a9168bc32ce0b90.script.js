(function process(g_request, g_response, g_processor) {

        var KC_LIST_IDS = {
            // Articles
            unpublished: "cdd099edfff52210e9c3ffffffffff9e",
            published: "92ff8d2dfff52210e9c3ffffffffff65",
            all: "143dc9e1fff52210e9c3ffffffffffdb",
            retired: "a2af012dfff52210e9c3ffffffffff38",
            // Ownership Groups
            my_approvals: "c63295edfff52210e9c3ffffffffffc3",
            pending_group_requests: "f02659e9ff392210e9c3ffffffffffed",
            all_groups: "f5696d2dffb92210e9c3ffffffffffb9",
            // Feedback Management
            feedback: "53cae161fff92210e9c3ffffffffff5e",
            my_flagged: "8ba4f5edff3d2210e9c3fffffffffff8",
            all_flagged: "6d5f4da9fff52210e9c3ffffffffff6d",
            my_submitted_tasks: "4e25bd21ff7d2210e9c3ffffffffffd5",
            my_assigned_tasks: "0a4575edff3d2210e9c3ffffffffffef",
            my_closed_tasks: "26967965ff7d2210e9c3ffffffffff4d",
            all_open_tasks: "02f6f561ff7d2210e9c3ffffffffff08",
            all_closed_tasks: "1b17b9a5ff7d2210e9c3ffffffffff6f",
            // Administration
            knowledge_bases: "cf7b35e1ffbd2210e9c3ffffffffffbd",
            article_templates: "89cb3565ffbd2210e9c3ffffffffff5c",
            ratings: "c14f8661ffb16210e9c3ffffffffff1e",
            search_log: "5f8f06a1ffb16210e9c3ffffffffffed",
            view_log: "4cdf82e1ffb16210e9c3ffffffffff5e",
            navigation_add_ons: "87001ae1ffb16210e9c3fffffffffff1",
            messages: "d9409a25ffb16210e9c3ffffffffff2f",
            user_criteria: "8ca05a65ffb16210e9c3ffffffffff98",
            // Article Quality Index
            aqi_checklists: "b2719629ffb16210e9c3ffffffffffb6",
            all_completed_aqi: "3c329ea9ffb16210e9c3ffffffffff5d",
            all_pending_aqi: "6382dea9ffb16210e9c3ffffffffff5c",
            my_pending_aqi: "d1c2da2dffb16210e9c3ffffffffff5f",
            my_completed_aqi: "9fd4d2e1fff16210e9c3ffffffffff3d"
        };

        var UI16_PAGES = {
            // Articles
            unpublished: {
                page: "kb_knowledge_list.do",
                query: "workflow_state=draft^ORworkflow_state=review^ORworkflow_state=scheduled_publish"
            },
            published: {
                page: "kb_knowledge_list.do",
                query: "workflow_state=published"
            },
            all: {
                page: "kb_knowledge_list.do",
                query: "sys_class_name!=kb_knowledge_block"
            },
            retired: {
                page: "kb_knowledge_list.do",
                query: "workflow_state=retired"
            },
            // Ownership Groups
            my_approvals: {
                page: "sysapproval_approver_list.do",
                query: "approverDYNAMIC90d1921e5f510100a9ad2572f2b477fe^sysapproval.ref_sc_req_item.cat_item=00766c3c67271300dbfdbb2d07415ae8"
            },
            pending_group_requests: {
                page: "sc_req_item_list.do",
                query: "cat_item=00766c3c67271300dbfdbb2d07415ae8^opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=3"
            },
            all_groups: {
                page: "sys_user_group_list.do",
                query: "typeLIKE458de4f067671300dbfdbb2d07415ad6"
            },
            // Feedback Management
            feedback: {
                page: "kb_feedback_list.do",
                query: "article.kb_knowledge_base.kb_managersLIKEjavascript:gs.getUserID()^ORarticle.kb_knowledge_base.owner.sys_id=javascript:gs.getUserID()"
            },
            my_flagged: {
                page: "kb_knowledge_list.do",
                view: "Flagged",
                query: "flagged=true^authorDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORrevised_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORownership_groupDYNAMICd6435e965f510100a9ad2572f2b47744^ORownership_group.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^sys_class_name!=kb_knowledge_block" 
                },
                all_flagged: {
                    page: "kb_knowledge_list.do",
                    view: "Flagged",
                    query: "flagged=true^sys_class_name!=kb_knowledge_block"
                },
                my_submitted_tasks: {
                    page: "kb_feedback_task_list.do",
                    query: "opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe"
                },
                my_assigned_tasks: {
                    page: "kb_feedback_task_list.do",
                    query: "assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^ORassignment_group.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^stateNOT IN3"
                },
                my_closed_tasks: {
                    page: "kb_feedback_task_list.do",
                    query: "stateIN3^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORassignment_groupDYNAMICd6435e965f510100a9ad2572f2b47744^ORassignment_group.managerDYNAMIC90d1921e5f510100a9ad2572f2b477fe"
                },
                all_open_tasks: {
                    page: "kb_feedback_task_list.do",
                    query: "stateNOT IN3"
                },
                all_closed_tasks: {
                    page: "kb_feedback_task_list.do",
                    query: "stateIN3"
                },
                // Administration
                knowledge_bases: {
                    page: "kb_knowledge_base_list.do",
                    query: "active=true"
                },
                article_templates: {
                    page: "kb_article_template_list.do",
                    query: ""
                },
                ratings: {
                    page: "kb_feedback_list.do",
                    view: "Rating",
                    query: "ratingISNOTEMPTY^ORuseful!="
                },
                search_log: {
                    page: "ts_query_kb_list.do",
                    query: ""
                },
                view_log: {
                    page: "kb_use_list.do",
                    query: ""
                },
                navigation_add_ons: {
                    page: "kb_navons_list.do",
                    query: ""
                },
                messages: {
                    page: "sys_ui_message_list.do",
                    query: "application=kb"
                },
                user_criteria: {
                    page: "user_criteria_list.do",
                    query: "active=true"
                },
                // Article Quality Index
                aqi_checklists: {
                    page: "kb_quality_checklist_list.do",
                    query: ""
                },
                all_completed_aqi: {
                    page: "kb_article_checklist_summary_list.do",
                    query: "state=submitted"
                },
                all_pending_aqi: {
                    page: "kb_article_checklist_summary_list.do",
                    query: "state!=submitted"
                },
                my_pending_aqi: {
                    page: "kb_article_checklist_summary_list.do",
                    query: "reviewerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state!=submitted"
                },
                my_completed_aqi: {
                    page: "kb_article_checklist_summary_list.do",
                    query: "reviewerDYNAMIC90d1921e5f510100a9ad2572f2b477fe^state=submitted"
                }
            };

            var shouldNavigateToKnowledgeCenter = new KBCommon().shouldRedirectToKnowledgeCenter();
            var kbListType = String(g_request.getParameter("sysparm_kb_list_type"));

            if (shouldNavigateToKnowledgeCenter) {
                var listId = KC_LIST_IDS[kbListType];
                if (listId) {
                    g_response.sendRedirect("now/knowledge-center/list/params/list-id/" + listId);
                }
            } else {
                var config = UI16_PAGES[kbListType];
                if (config) {
                    var url = config.page;
                    if (config.view) url += "?sysparm_view=" + encodeURI(config.view);
                    if (config.query) url += (config.view ? "&" : "?") + "sysparm_query=" + encodeURI(config.query);
                    g_response.sendRedirect(url);
                }
			}
})(g_request, g_response, g_processor);
