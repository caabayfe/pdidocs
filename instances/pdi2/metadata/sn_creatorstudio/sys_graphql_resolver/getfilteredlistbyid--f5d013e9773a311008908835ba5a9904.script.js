(function process( /*ResolverEnvironment*/ env) {

    const {
        filteredListID
    } = env.getArguments();
    try {
        if (!filteredListID) {
            const error = ErrorService.createError(
                ErrorService.ERROR_TYPES.BAD_REQUEST,
                gs.getMessage('filteredListID is required'));
            throw error;
        }
        const fieldSchema = {
            condition: 'condition',
            active: 'active',
            sys_id: 'id',
            table: 'table',
            category:'categoryId',
            columns: ['selectedColumns', 'defaultColumns']
        };
        return ListService.getFilterdListByID(filteredListID, fieldSchema);
    } catch (e) {
        return e;
    }
})(env);
