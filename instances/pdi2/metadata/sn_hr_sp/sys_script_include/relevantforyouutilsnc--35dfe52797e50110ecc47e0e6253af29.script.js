        var RelevantForYouUtilSNC = Class.create();
        RelevantForYouUtilSNC.prototype = {
            initialize: function(instanceId, statsParentId) {
                this.isHRCoreActive = GlidePluginManager.isActive('com.sn_hr_core');
                this.isEmployeeProfileEnabled = GlidePluginManager.isActive('com.sn_employee') && GlideApplicationProperty.getValue('sn_employee.employee_profile_enabled') == 'true' ? true : false;
                this.similarUsers = [];
                this.userRecommendationUtil = new sn_hr_sp.UserRecommendationUtil(instanceId, statsParentId);
                this.useSimilarUserQuery = GlideApplicationProperty.getValue('sn_hr_sp.use_similar_user_query') == 'true' ? true : false;
            },
            getSimilarUsers: function(userPredictionCount) {
                // do not use similar users if the sys_property is false for using similar user query
                if (!this.useSimilarUserQuery) {
                    return [];
                }
                if (GlidePluginManager.isActive('com.glide.platform_ml') && (this.isHRCoreActive || this.isEmployeeProfileEnabled)) {
                    /*
                     * The system property 'apply_employee_profile_ml_model' when enabled allows HR customers to use ML models specified under Employee
                     * profile AI configurations.
                     */
                    var applyEmployeeProfileMlModel = gs.getProperty('sn_employee.apply_employee_profile_ml_model', 'false') == 'true' ? true : false;
                    if (this.isHRCoreActive && !applyEmployeeProfileMlModel) {
                        var ML_PortalUtils = new sn_hr_sp.HR_MLPortalUtils();
                        this.similarUsers = ML_PortalUtils.getSimilarUsers(gs.getUserID(), userPredictionCount);
                    } else {
                        var EP_PortalUtils = new sn_employee.EP_MLPortalUtils();
                        this.similarUsers = EP_PortalUtils.getSimilarUsers(gs.getUserID(), userPredictionCount);
                    }
                }
                return this.similarUsers;
            },

            getRelevantArticlesAndCatalogs: function(articlePayload, catalogPayload, displayCount, userPredictionCount, taxonomyId) {
                var articles = [];
                var catalogs = [];
                this.getSimilarUsers(userPredictionCount);
                if (this.similarUsers && this.similarUsers.length > 0) {

                    if (!gs.nil(articlePayload)) {
                        articles = this.getSimilarUserArticles(this.similarUsers, articlePayload.knowledgeBases, articlePayload.articleCount, articlePayload.recentActivityCutoffDate, taxonomyId);
                        if (articles.length < displayCount) {
                            var mostViewedArticleCount = displayCount - articles.length;
                            var articlesToIgnore = articles.map(function(item) {
                                return item.sys_id;
                            });
                            var mostViewedArticles = this.getMostViewedArticles(articlePayload.knowledgeBases, articlePayload.kbRecords, mostViewedArticleCount, articlesToIgnore, taxonomyId);
                            articles = articles.concat(mostViewedArticles);
                        }
                    }

                    if (!gs.nil(catalogPayload)) {
                        catalogs = this.getCatalogItems(this.similarUsers, catalogPayload.catalogCount, null, catalogPayload.recentActivityCutoffDate, taxonomyId);
                        if (catalogs.length < displayCount) {
                            catalogPayload.catalogCount = displayCount - catalogs.length;
                            var catalogItemsToIgnore = catalogs.map(function(item) {
                                return item.sys_id;
                            });
                            catalogPayload.ignoredCatalogs = catalogItemsToIgnore;
                            catalogPayload.users = null;
                            var popularItems = this.userRecommendationUtil.getCatalogItems(catalogPayload);
                            catalogs = catalogs.concat(popularItems);
                        }
                    }
                } else {
                    if (!gs.nil(articlePayload))
                        articles = this.getMostViewedArticles(articlePayload.knowledgeBases, articlePayload.kbRecords, displayCount, null, taxonomyId);
                    if (!gs.nil(catalogPayload))
                        catalogs = this.getCatalogItems(null, catalogPayload.catalogCount, null, catalogPayload.recentActivityCutoffDate, taxonomyId);

                    return this.getArticlesAndCatalog(articles, catalogs, displayCount);
                }
                var totalData = this.getCombinedData(articles, catalogs, displayCount);
                return totalData;
            },

            getMostViewedArticles: function(knowledgeBases, kbRecords, articleCount, ignoreArticles, taxonomyId) {
                var articlePayload = {
                    knowledgeBases: knowledgeBases,
                    kbRecords: kbRecords,
                    articleCount: articleCount,
                    ignoreArticles: ignoreArticles,
                    taxonomyId: taxonomyId
                };
                var articles = this.userRecommendationUtil.getMostViewedArticles(articlePayload);
                return articles;
            },

            getSimilarUserArticles: function(users, knowledgeBases, displayCount, recentActivityCutoffDate, taxonomyId) {
                var articlesPayload = {
                    users: users,
                    knowledgeBases: knowledgeBases,
                    articleCount: displayCount,
                    recentActivityCutoffDate: recentActivityCutoffDate,
                    taxonomyId: taxonomyId
                };
                return this.userRecommendationUtil.getArticlesforSimilarUsers(articlesPayload);
            },

            getCatalogItems: function(users, catalogCount, ignoredCatalogs, recentActivityCutoffDate, taxonomyId) {
                var catalogPayload = {
                    users: users,
                    catalogCount: catalogCount,
                    ignoredCatalogs: ignoredCatalogs,
                    recentActivityCutoffDate: recentActivityCutoffDate,
                    taxonomyId: taxonomyId
                };
                return this.userRecommendationUtil.getCatalogItems(catalogPayload);
            },

            getCombinedData: function(articleResults, catalogResults, displayCount) {
                return this.userRecommendationUtil.getNormalizedData({
                    articleResults: articleResults,
                    catalogResults: catalogResults
                }, displayCount, true);
            },

            isRecentActivitySysPropertyConfigured: function() {
                return this.userRecommendationUtil.getRecentActivityPropertyConfigured();
            },

            sortCatalogAndArticles: function(a, b) {
                return b.score - a.score;
            },

            getArticlesAndCatalog: function(articles, catalogs, displayCount) {
                return this.userRecommendationUtil._getNormalizedCatalogAndArticle(articles, catalogs, this.sortCatalogAndArticles, displayCount);
            },

            type: 'RelevantForYouUtilSNC'
        };
