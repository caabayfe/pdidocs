var MLPredictionUtilsSNC = Class.create();
MLPredictionUtilsSNC.prototype = {
    initialize: function() {
        this.predictor = new MLPredictor();
    },

    getPredictor: function() {
        return this.predictor;
    },

    type: 'MLPredictionUtilsSNC'
};
