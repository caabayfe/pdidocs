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
    const filterOption = api.state.selectedFilter;
    const currentUser = api.context.session.user.sys_id;
    const searchText = api.state.searchText.toLowerCase();
    const isFilterApplied = !(searchText == '' && filterOption == 'all');

    const areAllArraysEmpty = (...args) => args.every(arr => Array.isArray(arr) && arr.length === 0);

    const getParticipantNames = (participants) => {
        let users = participants.map(user => {
            if (user.name) return user.name.toLowerCase();
            return user.displayName.toLowerCase();
        });
        return users.join(',');
    };

    const shouldIncludeCommunicationTask = (task) => {
        const description = task.description.toLowerCase();
        if (!description.includes(searchText)) return false;

        switch (filterOption) {
            case 'all':
                return true;
            case 'teams-chats':
                return task.is_teams_collaboration;
            case 'sidebar-discussions':
                return task.is_sidebar_collaboration;
        }
        return false;
    };

    const shouldIncludeChat = (chat) => {
        const title = (chat.topic ? chat.topic : chat.title).toLowerCase();
        const participants = getParticipantNames(chat.users ? chat.users : chat.participants);

        if (!(title.includes(searchText) || participants.includes(searchText))) return false;

        switch (filterOption) {
            case 'all':
                return true;
            case 'teams-chats':
                return chat.type === 'microsoft_teams_chat';
            case 'sidebar-discussions':
                return chat.type === 'sidebar_discussion';
            case 'created-by-me':
                return chat.createdBy === currentUser;
            case 'created-by-others':
                return chat.createdBy !== currentUser;
        }
        return false;
    };

    let filteredChats = {};
    filteredChats.active = isFilterApplied ? api.state.collabChats.filter(chat => shouldIncludeChat(chat)) : api.state.currentChats;
    filteredChats.pending = isFilterApplied ? api.state.formattedPendingTasks.filter(task => shouldIncludeCommunicationTask(task)) : api.state.formattedPendingTasks;
    filteredChats.isEmpty = isFilterApplied ? areAllArraysEmpty(filteredChats.active, filteredChats.pending) : false;
    api.setState('filteredChats', { ...filteredChats });
}
