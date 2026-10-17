async function handler({api, event, helpers, imports}) {
    if (event.payload) {
        const {table, query, listTitle} = event.payload;

        if (table && query && listTitle) {
            const fields = { table };
            const params = { query, listTitle };

            helpers.navigate.to('simplelist', fields, params);
        }
    }
}
