function script({api, event}) {
      const pageSize = event.payload.pageSize;
      const prevSize = api.state.rowLimit;
      if (pageSize !== prevSize) {
        api.setState('rowLimit', pageSize);
        api.data.save_user_preference.execute({
          name: "rowcount",
          value: pageSize
        })
        api.emit('LIST_CTRL#ROW_LIMIT_UPDATED', {
          limit: pageSize,
          prevLimit: prevSize,
          table:api.state.table,
        });
      }
}
