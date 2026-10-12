function script({api, event, helpers}) {
        const tableOptions = api.data.dataManagerGetCertificationTableOptions?.output;
        api.setState("tableOptions", tableOptions);
}
