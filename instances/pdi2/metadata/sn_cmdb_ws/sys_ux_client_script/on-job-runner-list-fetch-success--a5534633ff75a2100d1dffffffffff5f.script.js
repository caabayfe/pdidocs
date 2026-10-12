function script({api, event}) { 

    const {output} = api.data.dataManagerGetJobRunners;
    api.setState('runAsUsersList', output.userList);
}
