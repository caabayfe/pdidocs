/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const recordMembers =  api.state.recordMembers;
    // Create a map to track unique users by sys_id
	let userMap = new Map();
    let newUsers = event.payload.users;
	recordMembers.forEach(
		user => user?.sys_id && userMap.set(user.sys_id, user)
	);

	newUsers.forEach(
		user => user?.sys_id && userMap.set(user.sys_id, { ...(userMap.get(user.sys_id) || {}), ...user})
	);
	const uniqueUsers = Array.from(userMap.values());
    api.setState("recordMembers", uniqueUsers, true);
}
