/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (api.context.props.id !== '-1' && api.data.get_setup_info.items && api.data.get_setup_info.items.length !== 0) {
        let pageInput = { ...api.state.pageInput };
        let disableContinue = { ...api.state.disableContinue };
        let setupInfo = api.data.get_setup_info.result;
        let processId = setupInfo.process_definition.value;
     
        pageInput.name = setupInfo.name.value;
        pageInput.description = setupInfo.description.value;
        
        if(setupInfo?.setup_layout?.value) {
          pageInput.setup_layout = setupInfo.setup_layout.value;
        }

        if(setupInfo.setup_execution_type.value) {
          pageInput.setup_execution_type = setupInfo.setup_execution_type.value;
          if ( pageInput.setup_execution_type == 'single') {
            api.setState('hideSkipExecution', true);
          }
        }

        if(setupInfo.skip_execution_page.value) {
          pageInput.skip_execution_page = setupInfo.skip_execution_page.value;
        }

        //Get name & description from process definition table
        if (processId) {
            pageInput.name = setupInfo.process_definition._reference.label.displayValue;
            pageInput.description = setupInfo.process_definition._reference.description.displayValue;
        }
        pageInput.roles = setupInfo.roles.value;
        api.setState('pageInput', pageInput);
        disableContinue['basic'] = !(pageInput.name && pageInput.description);
        api.setState('disableContinue', disableContinue);
        api.setState('processId', processId);
    } else {
      api.setState('hideSkipExecution', true);
    }
    return;
}
