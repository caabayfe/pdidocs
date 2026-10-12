var SOWITSMAdminCenterContent = Class.create();
SOWITSMAdminCenterContent.prototype = {
    initialize: function() {},

    getFAQs: function() {
        return [{
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "What updates were introduced in the November 2024 release for the SOW admin center?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>In the November 2024 release, we introduced two key updates:<div><p>1. Learning tab: We added a Learning Tab to provide users with up-to-date resources to learn more about SOW admin configuration. It compiles and highlights significant resources for easy access.</p><p>2. Visual refresh: We introduced a modern and sleek design to enhance the look and feel of the Service Operations Workspace admin center.</p></div><div><p>These updates aim to enhance usability and provide better support for SOW administrators.</p></div></p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "When does the support end for Agent Workspace?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>We are no longer making investments in the Agent Workspace experience, and our product investments will be going into the Service Operations Workspace. As of Utah family release, we have begun the deprecation process for the classic ITSM Agent Workspace and ITOM Operator Workspace. We recommend that all new/existing customers looking to implement Agent or Operator Workspace start with Service Operations Workspace, as support for Agent Workspace and Operator Workspace will end by the Washington DC family release.</p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Where can I see the core capabilities available in SOW?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>Check out our individual guides for a deep dive into all the capabilities available in Service Operations Workspace:<div><now-text-link label='Incident Management in SOW' href='https://www.servicenow.com/community/service-operations-workspace/quick-start-guide-for-incident-management-in-sow/ta-p/2627381' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link><br><now-text-link label='Change Management in SOW' href='https://www.servicenow.com/community/service-operations-workspace/quick-start-guide-for-change-management-in-sow/ta-p/2626600' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link><br><now-text-link label='Alert Management in SOW' href='https://www.servicenow.com/community/service-operations-workspace/quick-start-guide-for-alert-management-in-sow/ta-p/2627356' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link></div></p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Are there release notes available?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>Yes, they are located within our <now-text-link label='Product documentation' href='https://docs.servicenow.com/bundle/store-release-notes/page/release-notes/store/it-service-management/store-rn-itsm-service-ops-workspace-apps.html' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link>.</p >")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Are there any videos that I can watch about the Service Operations Workspace?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>We have a few videos which demonstrate <now-text-link label='SOW capabilities from the Tokyo release' href='https://www.servicenow.com/community/service-operations-workspace/recordings-2024-service-operations-workspace-sow-launch-amp/ta-p/2955490' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link>.</p><p>Stay tuned for future demos and walkthrough videos.</p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "What plugins do I need to install for SOW?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>The necessary plugins are packaged with the latest family release with the ITSM package of products. Several types of components are installed with the Service Operations Workspace ITSM Applications application (sn-sow-itsm-cont) installation, including user role, plugins, and ServiceNow Store applications.Check out our ServiceNow Store for more details: <now-text-link label='ServiceNow Store' href='https://store.servicenow.com/sn_appstore_store.do#!/store/home' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'> ServiceNow Store </now-text-link></p >")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "How do I redirect an agent to the Service Operations workspace Landing page?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>Enable an agent to quickly start prioritizing tasks by redirecting the agent to the Service Operations Workspace landing page after logging in to the ServiceNow instance. Ensure that Next Experience is enabled on your instance. For specific steps, please click <now-text-link label='here' href='https://docs.servicenow.com/csh?topicname=redirect-sow-landing-page.html&version=latest' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link>.</p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Can customers use UI Builder for Service Operations Workspace?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>Yes, UI Builder can be used to configure individual components of the workspace.</p><p>For information on how to use UI Builder, please reference <now-text-link label='here' href='https://www.servicenow.com/community/next-experience-articles/ui-builder-quick-start-guide/ta-p/2332091' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link>.</p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Will customers be able to make changes to the visuals of the Workspace?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>Yes, SOW has been designed to be highly configurable, where you can easily configure the visuals of the workspace as per your need.</p>")
            },
            {
                "question": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "I think I have a bug or defect with Service Operations Workspace, what do I do?"),
                "answer": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "<p>We have an active and supportive Service Now community site Forum, where you can post your questions, check existing articles and solutions. If you are unable to resolve the issue and believe you have a defect with SOW, log a case using the <now-text-link label='Now Support portal' href='https://support.servicenow.com/now' style='text-decoration: underline;color: RGB(var(--now-text-link--primary--color,var(--now-color--secondary-1,1,119,142)))' opens-window='true'></now-text-link>.</p>")
            }
        ];
    },

    getHelpfulLinks: function() {
        return [{
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Comprehensive FAQ"),
                "link": "https://www.servicenow.com/community/service-operations-workspace/faq-for-service-operations-workspace/ta-p/2627397"
            },
            {
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "SOW documentation"),
                "link": "https://docs.servicenow.com/bundle/xanadu-it-service-management/page/product/service-operations-workspace/concept/getting-started-sow.html"
            },
            {
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Take our Now Learning course"),
                "link": "https://nowlearning.servicenow.com/lxp?id=learning_course_prev&course_id=88083f321baf8dd0520b6adb234bcb37"
            },
            {
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Agent vs. configurable workspaces"),
                "link": "https://www.servicenow.com/community/next-experience-articles/learn-about-the-differences-between-agent-workspace-legacy-and/ta-p/2332026"
            },
            {
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Migrating to a configurable workspace"),
                "link": "https://www.servicenow.com/community/next-experience-articles/basic-overview-on-migrating-to-a-configurable-workspace/ta-p/2332022"
            },
            {
                "label": sn_i18n.Message.getMessage("sn_sow_itsm_admin", "Process workshop presentation"),
                "link": "https://nowlearning.servicenow.com/nowcreate?id=nc_asset&asset_id=037a05cf1bc64d14f95e99b8bd4bcb6c"
            },
        ];
    },

    type: 'SOWITSMAdminCenterContent'
};
