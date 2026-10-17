/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    function updateStepperStateWith(generatorState) {
        // find step matching this id
        let stateIndexBeingUpdated = api.state.stepperState.findIndex(state => (state.id === generatorState.id));
        if (stateIndexBeingUpdated === -1) {
            console.log('Could not find step with id: ' + generatorState.id);
            return;
        }

        let stepperStateCopy = api.state.stepperState.map(element => element);
        stepperStateCopy[stateIndexBeingUpdated].progress = generatorState.progress;
        stepperStateCopy[stateIndexBeingUpdated].sublabel = generatorState.sublabel;
        api.setState('stepperState', stepperStateCopy);
    }

    function updateErrorState(errorMessage) {
        let certificateGenErrorState = {};
        certificateGenErrorState.isHidden = false;
        certificateGenErrorState.message = errorMessage;
        api.setState('certificateGeneratorErrorState', certificateGenErrorState);
    }

    let progressState = event.payload.progressState;
    let errorMessage = progressState.error;
    if (errorMessage !== undefined && errorMessage.length != 0) {
        updateErrorState(errorMessage);
        return;
    }

    updateStepperStateWith(progressState);
}
