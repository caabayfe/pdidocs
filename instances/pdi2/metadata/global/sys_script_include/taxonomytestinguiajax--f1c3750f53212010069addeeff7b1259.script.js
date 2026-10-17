var TaxonomyTestingUIAjax = Class.create();
TaxonomyTestingUIAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    canAccessTestingPage: function() {
        // Only accessible by user with admin role
        var impersonateUtil = new GlideImpersonate();
        var isImpersonating = impersonateUtil.isImpersonating();
        var hasAccess = false;
        if (isImpersonating) {
            var impersonatingUserId = gs.getImpersonatingUserName();
            var impersonatingUser = gs.getUser().getUserByID(impersonatingUserId);
            hasAccess = impersonatingUser.hasRole("admin");
        } else
            hasAccess = gs.hasRole("admin");
        return hasAccess;
    },

    getRootTopicIdsOfTaxonomy: function() {
        if (!this.canAccessTestingPage())
            return "";

        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var errors = [];
        var taxonomyId = inputs["taxonomyId"];
        try {
            var topics = new sn_taxonomy.Taxonomy(taxonomyId).getRootTopicIds();
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": topics,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    canViewTopic: function() {
        if (!this.canAccessTestingPage())
            return "";

        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var errors = [];
        var topicId = inputs["topicId"];
        var isMobile = inputs["isMobile"];
        var res = "true";
        try {
            var canView = new sn_taxonomy.Topic(topicId).canView(isMobile);
            if (!canView)
                res = "false";
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": res,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getChildTopicIdsOfTopic: function() {
        if (!this.canAccessTestingPage())
            return "";

        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var errors = [];
        var topicId = inputs["topicId"];
        var includeChildTopics = inputs["includeChildTopics"];
        try {
            var topics = new sn_taxonomy.Topic(topicId).getChildTopicIds(includeChildTopics);
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": topics,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getTopicsOfTaxonomy: function() {
        if (!this.canAccessTestingPage())
            return "";

        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var taxonomyId = inputs["taxonomyId"];
        var hideTopicsWithNoCotent = inputs["hideTopicsWithNoCotent"];
        var maxLevel = inputs["maxLevel"];
        var isMobile = inputs["isMobile"];
        var errors = [];
        var topics;
        try {
            var taxonomyJs = new sn_taxonomy.Taxonomy(taxonomyId);
            topics = taxonomyJs.getTopics(hideTopicsWithNoCotent, maxLevel, isMobile);
            for (var i = 0; i < topics.length; i++) {
                bannerImage = sn_taxonomy.Topic.getBannerImage(topics[i].sys_id);
                icon = sn_taxonomy.Topic.getIcon(topics[i].sys_id);
                topics[i].bannerImage = bannerImage;
                topics[i].icon = icon;
            }
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": topics,
            "errors": errors
        };
        return JSON.stringify(resp);
    },
    getChildTopicsOfTopic: function() {
        if (!this.canAccessTestingPage())
            return "";
        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var topicId = inputs["topicId"];
        var hideTopicsWithNoCotent = inputs["hideTopicsWithNoCotent"];
        var limit = inputs["limit"];
        var offset = inputs["offset"];
        var isMobile = inputs["isMobile"];
        var errors = [];
        var childTopics;
        var bannerImage;
        var icon;
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            childTopics = topicJs.getChildTopics(hideTopicsWithNoCotent, isMobile, limit, offset);
            var topics = childTopics.topics;
            for (var i = 0; i < topics.length; i++) {
                bannerImage = sn_taxonomy.Topic.getBannerImage(topics[i].sys_id);
                icon = sn_taxonomy.Topic.getIcon(topics[i].sys_id);
                topics[i].bannerImage = bannerImage;
                topics[i].icon = icon;
            }
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": childTopics,
            "offset": childTopics.offset,
            "limit": childTopics.limit,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getContent: function() {
        if (!this.canAccessTestingPage())
            return "";
        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var topicId = inputs["topicId"];
        var includeChildren = inputs["includeChildren"];
        var limit = inputs["limit"];
        var isMobile = inputs["isMobile"];
        var excludeItems = JSON.parse(inputs["excludeItems"]);
        var contentConfigId = JSON.parse(inputs["contentConfigId"]);
        var errors = [];
        var content;
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            content = topicJs.getContent(includeChildren, limit, isMobile, excludeItems, contentConfigId);
        } catch (e) {
            errors.push(e.getMessage());
        }
        for (var i = 0; i < content.length; i++) {
            // Add extra details for convenience
            content[i].title = this.getTitle(content[i]);
        }
        var resp = {
            "result": content,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getContentByPopularity: function() {
        if (!this.canAccessTestingPage())
            return "";
        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var topicId = inputs["topicId"];
        var includeChildren = inputs["includeChildren"];
        var limit = inputs["limit"];
        var isMobile = inputs["isMobile"];
        var excludeItems = JSON.parse(inputs["excludeItems"]);
        var contentConfigId = JSON.parse(inputs["contentConfigId"]);
        var errors = [];
        var content;
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            content = topicJs.getContentByPopularity(includeChildren, limit, isMobile, excludeItems, contentConfigId);
        } catch (e) {
            errors.push(e.getMessage());
        }
        for (var i = 0; i < content.length; i++) {
            // Add extra details for convenience
            content[i].title = this.getTitle(content[i]);
        }
        var resp = {
            "result": content,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getFeaturedContent: function() {
        if (!this.canAccessTestingPage())
            return "";
        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var topicId = inputs["topicId"];
        var limit = inputs["limit"];
        var isMobile = inputs["isMobile"];
        var contentConfigId = JSON.parse(inputs["contentConfigId"]);
        var errors = [];
        var content;
        try {
            var topicJs = new global.TaxonomyPortalUtil();
            content = topicJs.getFeaturedContent(topicId, limit, isMobile, contentConfigId);
        } catch (e) {
            errors.push(e.getMessage());
        }
        for (var i = 0; i < content.length; i++) {
            // Add extra details for convenience
            content[i].title = this.getTitle(content[i]);
        }
        var resp = {
            "result": content,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    getTitle: function(content) {
        var title = "No_TITLE";
        var tableName = content.content_table;
        var sysId = content.content;
        var gr = new GlideRecord(tableName);
        gr.get(sysId);
        if (tableName == "kb_knowledge")
            title = gr.getValue("short_description");
        else if (tableName == "sc_cat_item")
            title = gr.getValue("name");
        return title;
    },

    getSiblingTopicsOfTopic: function() {
        if (!this.canAccessTestingPage())
            return "";
        var inputs = this.getParameter("sysparm_inputs");
        inputs = JSON.parse(inputs);
        var topicId = inputs["topicId"];
        var hideTopicsWithNoCotent = inputs["hideTopicsWithNoCotent"];
        var isMobile = inputs["isMobile"];
        var limit = inputs["limit"];
        var offset = inputs["offset"];
        var errors = [];
        var sibilingTopics;
        try {
            var topicJs = new sn_taxonomy.Topic(topicId);
            sibilingTopics = topicJs.getSiblingTopics(hideTopicsWithNoCotent, isMobile, limit, offset);
            var topics = sibilingTopics.topics;
            for (var i = 0; i < topics.length; i++) {
                bannerImage = sn_taxonomy.Topic.getBannerImage(topics[i].sys_id);
                icon = sn_taxonomy.Topic.getIcon(topics[i].sys_id);
                topics[i].bannerImage = bannerImage;
                topics[i].icon = icon;
            }
        } catch (e) {
            errors.push(e.getMessage());
        }
        var resp = {
            "result": sibilingTopics,
            "offset": sibilingTopics.offset,
            "limit": sibilingTopics.limit,
            "errors": errors
        };
        return JSON.stringify(resp);
    },

    type: 'TaxonomyTestingUIAjax'
});
