/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const { snHttp } = helpers;
    const isNewCategory = api.context.props.categoryId === "-1";
    const categoryInput = api.state.categoryInput;
    let related_content = [];
    if (categoryInput.article.title)
        related_content.push({
            type: 'document',
            title: categoryInput.article.title,
            url: categoryInput.article.url,
            sys_id: categoryInput.article.sys_id
        });

    if (categoryInput.video.title)
        related_content.push({
            type: 'video',
            title: categoryInput.video.title,
            url: categoryInput.video.url,
            sys_id: categoryInput.video.sys_id
        });

    const body = {
        name: categoryInput.name,
        rich_description: categoryInput.description,
        type: 'group',
        sys_id: categoryInput.sys_id,
        content: {
            sys_id: categoryInput.content_sys_id,
            related_content
        }
    };

    snHttp(`api/sn_ads_setup/build/setup/${api.context.props.setupId}/step/${api.context.props.categoryId}`, {
        method: isNewCategory ? 'POST' : 'PUT',
        batch: false,
        body: body
    })
    .then(({
        response
    }) => {
        const taskId = api.context.props.categoryId === "-1" ? "-1" : (api.data.get_all_tasks.results.length ? api.data.get_all_tasks.results[0].sys_id.value : "-1");
        api.setState('taskView', true);
        api.setState('currentTaskId', [[taskId]]);
        helpers.navigate.to("step", {
            "setupId": api.context.props.setupId,
            "categoryId": response.result.sys_id
        }, {
            "taskId": taskId
        });
        api.data.get_setup_category_rest.refresh();
    })
    .catch(({
        error
    }) => {
        //TODO: Open notification
        console.log(error);
    });
}
