function include() {
    const addDataToContext = (args) => {
        const { api: { data, context } } = args;
        context.props = {
            ...context.props,
            table: context.props.inputTable,
            sysId: context.props.inputSysId
        }
    }

    return {
       addDataToContext
    }
}
