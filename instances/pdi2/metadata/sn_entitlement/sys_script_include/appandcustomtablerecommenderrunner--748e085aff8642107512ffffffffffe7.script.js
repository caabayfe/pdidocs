var AppAndCustomTableRecommenderRunner = Class.create();

(function() {
    const globalTableRecDAO = new GlobalCustomTablesRecommendationDAO();
    const appRecDAO = new CustomApplicationsRecommendationDAO();

    function insertGlobalTableRecommendations(globalCustomTableRecommendations) {
        //Clear the table before inserting
        globalTableRecDAO.deleteAllRecords();

        // Insert the new recommendations for global custom tables
        for (const [customTableInventorySysId, recommendations] of Object.entries(globalCustomTableRecommendations)) {
            recommendations.forEach(recommendation => {
                const {
                    table,
                    idx,
                    weight,
                    subscriptionSysId
                } = recommendation;

                // The table will always be defined on the recommendation, if it is not, then
                // this was inserted by engine when no recommendations were found.
                // This should only happen in weird edge cases like Expired or Inactive subscription.
                const recommendationReason = table ?
                    AppAndCustomTableRecommenderEngine.getReasonText(table, idx, AppAndCustomTableRecommenderEngine.getReasonMessage) :
                    AppAndCustomTableRecommenderEngine.getReasonMessage(false, AppAndCustomTableRecommenderConstants.REASONS.DEFAULT);

                const customerMessage = table ?
                    AppAndCustomTableRecommenderEngine.getReasonText(table, idx, AppAndCustomTableRecommenderEngine.getCustomerReasonMessage).main :
                    AppAndCustomTableRecommenderEngine.getCustomerReasonMessage(false, AppAndCustomTableRecommenderConstants.REASONS.DEFAULT);

                globalTableRecDAO.insert(customTableInventorySysId, subscriptionSysId, weight, recommendationReason, customerMessage);
            });
        }
    }

    function insertAppRecommendations(appLicenseRecommendations) {
        //Clear the table before inserting
        appRecDAO.deleteAllRecords();

        // Insert the new recommendations for apps (both global and scoped)
        for (const [appSysId, recommendations] of Object.entries(appLicenseRecommendations)) {
            recommendations.forEach(recommendation => {
                const {
                    table,
                    idx,
                    weight,
                    subscriptionSysId
                } = recommendation;

                // The table will always be defined on the recommendation, if it is not, then
                // this was inserted by engine when no recommendations were found.
                // This should only happen in weird edge cases like Expired or Inactive subscription.
                const recommendationReason = table ?
                    AppAndCustomTableRecommenderEngine.getReasonText(table, idx, AppAndCustomTableRecommenderEngine.getReasonMessage) :
                    AppAndCustomTableRecommenderEngine.getReasonMessage(true, AppAndCustomTableRecommenderConstants.REASONS.DEFAULT);

                const customerMessage = table ?
                    AppAndCustomTableRecommenderEngine.getReasonText(table, idx, AppAndCustomTableRecommenderEngine.getCustomerReasonMessage).main :
                    AppAndCustomTableRecommenderEngine.getCustomerReasonMessage(true, AppAndCustomTableRecommenderConstants.REASONS.DEFAULT);


                appRecDAO.insert(appSysId, subscriptionSysId, weight, recommendationReason, customerMessage);
            });
        }
    }

    AppAndCustomTableRecommenderRunner.run = function() {
        const customTableRelations = AppAndCustomTableRecommenderScraper.getCustomTableRelations();

        const {
            calculatedLicenses,
            globalCustomTableLicenseRecommendations,
            appLicenseRecommendations
        } = AppAndCustomTableRecommenderEngine.getRecommendLicenseForTables(customTableRelations);

        insertGlobalTableRecommendations(globalCustomTableLicenseRecommendations);
        insertAppRecommendations(appLicenseRecommendations);

        return {
            customTableRelations,
            calculatedLicenses,
            globalCustomTableLicenseRecommendations,
            appLicenseRecommendations
        };
    };

    AppAndCustomTableRecommenderRunner.prototype = {
        initialize: function() {
            throw 'Not supported';
        },
        type: 'AppAndCustomTableRecommenderRunner',
    };
})();
