function handler({
    api,
    event,
    helpers
}) {
    let pageInput = api.state.pageInput;
    let disabledSteps = { ...api.state.disabledSteps};
    /*
    disabledSteps: This state variable is a json which manages the primary action on each step(reference to stepper component step) of current selected task.
    */
    switch (event.elementId) {
        case "taskName":
            pageInput.step1.name = event.payload.fieldValue;
            disabledSteps.step1 = !(pageInput.step1.name && pageInput.step1.description);
            api.setState('disabledSteps', disabledSteps);
            api.setState('pageInput', pageInput);
            break;
        case "task_rich_description":
            pageInput.step1.description = event.payload.value;
            disabledSteps.step1 = !(pageInput.step1.name && pageInput.step1.description);
            api.setState('disabledSteps', disabledSteps);
            api.setState('pageInput', pageInput);
            break;
        case "table_name":
            pageInput.step2.tableName = event.payload.item;
            pageInput.step2.tableView = {
                id: "Default view"
            };
            api.setState('pageInput', pageInput);
            if (event.payload.value && api.state.pageInput.step2.tableView.id) {
                disabledSteps.step2 = false;
            } else {
                disabledSteps.step2 = true;
            }
            api.setState('disabledSteps', disabledSteps);
            api.data.form_view_for_table.refresh();
            break;
        case "get_setup_step":
            const stepDetails = api.data.get_setup_step.output.result;
            pageInput.step1.name = stepDetails.name;
            pageInput.step1.description = stepDetails.rich_description || stepDetails.description;
            disabledSteps.step1 = !(pageInput.step1.name && pageInput.step1.description);
            api.setState('disabledSteps', disabledSteps);
            api.setState('pageInput', pageInput);
            break;
        case "document_links":
            disabledSteps.step2 = !event.payload.isValid;
            const newPageInput = {...api.state.pageInput};
            newPageInput.step2.related_content = event.payload.links;
            api.setState('disabledSteps', disabledSteps);
            api.setState('pageInput', newPageInput);
            break;
        case 'get_setup_category_rest':
            let isNewCategory = api.context.props.categoryId === '-1' ? true : false;
            if(isNewCategory) {
                api.setState('disableCategoryPA', true);
                api.setState('taskNames', [{
                    "id": "-2",
                    "label": "New task",
                    "disabled": true
                }]);
                return;
            }

            const categoryInfo = api.data.get_setup_category_rest.output.result;
            const content = categoryInfo && categoryInfo.content; 
            const links =  (content && content.related_content) || [];
            const article = links.find(link => link.type === 'document') || {
                title: '',
                url: '',
                sys_id: '-1'
            };
            const video = links.find(link => link.type === 'video') || {
                title: '',
                url: '',
                sys_id: '-1'
            };
            

            api.setState('categoryInput', {
                name: categoryInfo.name,
                description: categoryInfo.rich_description || categoryInfo.description,
                article: {...article, isValid: true},
                video: {...video, isValid: true},
                content_sys_id: content && content.sys_id,
                sys_id: categoryInfo.sys_id
            });
            api.setState('isPluginStoreCategory', categoryInfo.isPluginCategory);

            const isValid = categoryInfo.name && (categoryInfo.rich_description || categoryInfo.description);
            if (isValid) {
                api.setState('disableCategoryPA', false);
            } else {
                api.setState('disableCategoryPA', true);
            }

            break;
        default:
            return;
    }

    return;
}
