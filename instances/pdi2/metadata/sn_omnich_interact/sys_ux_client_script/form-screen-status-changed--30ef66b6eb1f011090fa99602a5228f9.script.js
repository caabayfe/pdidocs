/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const { title, tooltipPreview, primaryItem, secondaryItems, hasUpdate, isDirty, status, screenParams } = event.payload;
    if (!title){
         api.emit('SCREEN_STATUS_CHANGED', {
            title,
            tooltipPreview,
            primaryItem,
            secondaryItems,
            hasUpdate,
            isDirty,
            status,
            screenParams: screenParams ? { table: screenParams.table, sysId: screenParams.sys_id } : null
        });
       return;
   }

    const setTitle = (newTitle) => {
        api.emit('SCREEN_STATUS_CHANGED', {
            title: newTitle,
            tooltipPreview,
            primaryItem,
            secondaryItems,
            hasUpdate,
            isDirty,
            status,
            screenParams: screenParams ? { table: screenParams.table, sysId: screenParams.sys_id } : null
        });
    }
    
    const hasTabTitleText = api.state.tabTitleText && api.state.tabTitleText.length > 0;
    const inProgress = api.state.interactionState === 'work_in_progress';
    
    if (!hasTabTitleText) {
        setTitle(title);
    } else if (hasTabTitleText && inProgress) {
        const tabTitleText = api.state.tabTitleText;
        helpers
            .translate(' - active conversation')
            .then((translated) => setTitle(tabTitleText + translated));
    } else {
        setTitle(api.state.tabTitleText);
    }
}
