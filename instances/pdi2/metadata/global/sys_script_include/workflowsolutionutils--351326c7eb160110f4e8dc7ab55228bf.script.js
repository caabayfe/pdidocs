var WorkflowSolutionUtils = Class.create();

(function() {

    WorkflowSolutionUtils.constants = {
        WORKFLOW_NLU_USECASE_NAME: 'Train NLU Solution'
    };

    WorkflowSolutionUtils.isNluSolution = function(solution) {
        if (solution != null) {
            var solutionProps = JSON.parse(solution.solution_properties);
            if (solutionProps.schedulingInfo && solutionProps.schedulingInfo.useCase == WorkflowSolutionUtils.constants.WORKFLOW_NLU_USECASE_NAME)
                return true;
            return false;
        }
    };

    WorkflowSolutionUtils.prototype = {
        initialize: function() {

        },
        type: 'WorkflowSolutionUtils'
    };
})();
