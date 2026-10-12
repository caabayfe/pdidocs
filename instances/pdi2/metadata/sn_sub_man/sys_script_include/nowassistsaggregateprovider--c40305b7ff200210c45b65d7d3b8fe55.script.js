var NowAssistsAggregateProvider = Class.create();
NowAssistsAggregateProvider.prototype = {
    initialize: function() {
        this._nowAssistsSkillsDao = new sn_entitlement.NowAssistsSkillsDao();
        this._skuMetaDataDao = new sn_sub_man.dao_SkuMetadata();
    },

    /**
     * Calculates the data for sn_sub_man_st_now_assists_aggregate
     * 
     * @returns {array} An array of objects representing the rows in the table
     */
    getData: function() {
        const featuresConsolidated = this._consolidateFeatures(this._skuMetaDataDao.getGenAiFeatures());
        const usageData = this._nowAssistsSkillsDao.getFeatureIdAndTotalAssists();

        return featuresConsolidated
            .filter(feature => this._isDisplayableFeature(feature))
            .map(feature => this._mapFeatureToResponse(usageData, feature))
            .filter(row => row);
    },

    /**
     * Features may be repeated due to being associated with multiple subscriptions.
     * Consolidate this down to a single feature record using the min assist ratio
     * 
     * @param {array} Array of feature objects
     * @returns {array} An array of feature objects were duplicates are removed and the min assist ratio is kept
     */
    _consolidateFeatures: function(features) {
        const featureIds = [...new Set(features.map(feature => feature.featureId))];

        return featureIds
            .map(id => {
                const featureCopies = features
                    .filter(feature => feature.featureId === id);

                const assistRatios = featureCopies
                    .map(feature => feature.assistRatio);
                const assistRatioMin = assistRatios && assistRatios.length > 0 ? Math.min(...assistRatios) : null;

                return {
                    featureId: featureCopies[0].featureId,
                    name: featureCopies[0].name,
                    assistRatio: assistRatioMin,
                };
            });
    },

    /**
     * Creates a row corresponding to what sn_sub_man_st_now_assists_aggregate expects
     * 
     * @param {guid} featureId The featureId to build the row for
     * @param {int} totalAssists The number of actions taken for the feature
     * @returns {object} An object comforming to { skills: '', no_of_actions: 0, assist_ratio: 0, total_assists: 0 }
     */
    _mapFeatureToResponse: function(usageData, feature) {
        if (!feature)
            return null;

        const assistRatio = feature.assistRatio;

        const totalAssists = usageData
            .filter(row => row.featureId === feature.featureId)
            .map(row => row.totalAssists)
            .reduce((acc, curr) => curr ? acc + curr : acc, 0);

        const accrualTime = usageData
            .filter(row => row.featureId === feature.featureId)
            .map(row => row.accrualTime)
            .reduce((acc, curr) => curr ? acc + curr : acc, 0);

        return {
            sys_id: feature.featureId,
            skills: feature.name,
            accrual_time: accrualTime,
            no_of_actions: parseInt(totalAssists / assistRatio),
            assist_ratio: parseFloat(assistRatio),
            total_assists: parseInt(totalAssists)
        };
    },

    /**
     * Determines if a feature can be displayed or not
     * 
     * @param {object} A feature response row
     * @returns {bool} True if the feature can be displayed
     */
    _isDisplayableFeature: function(row) {
        return row && row.assistRatio && row.assistRatio > 0;
    },

    type: 'NowAssistsAggregateProvider'
};
