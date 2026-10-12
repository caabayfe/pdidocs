var DartSubmitTraining = Class.create();
DartSubmitTraining.prototype = {

    create_job: function(solution_json, capability) {
        var name_to_fun_map = {
            'workflow': sn_ml.WorkflowSolution,
            'classification': sn_ml.ClassificationSolution,
            'regression': sn_ml.RegressionSolution,
            'clustering': sn_ml.ClusteringSolution,
            'similarity': sn_ml.SimilaritySolution,
            'encoder': sn_ml.Encoder,
        };
        var name_to_add = {
            'workflow': sn_ml.WorkflowSolutionStore,
            'classification': sn_ml.ClassificationSolutionStore,
            'regression': sn_ml.RegressionSolutionStore,
            'clustering': sn_ml.ClusteringSolutionStore,
            'similarity': sn_ml.SimilaritySolutionStore,
            'encoder': sn_ml.EncoderStore
        };

        if ('encoder' in solution_json) {
            solution_json['encoder'] = sn_ml.EncoderStore.get(solution_json['encoder']);
        }
        var my_solution = new name_to_fun_map[capability](solution_json);
        var solution_name = name_to_add[capability].add(my_solution);
        var solution_version = my_solution.submitTrainingJob();
        return solution_name;

    },

    type: 'DartSubmitTraining'
};
