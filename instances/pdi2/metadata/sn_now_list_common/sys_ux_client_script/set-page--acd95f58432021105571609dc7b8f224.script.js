function script({api, event}) {
    const currPage = event.payload.currentPage;
    const prevPage = api.state.currentPage;
    if (currPage !== prevPage) {
      api.setState('currentPage', currPage);
      api.emit('LIST_CTRL#PAGE_UPDATED', {
        page: currPage,
        prevPage: prevPage,
        table: api.state.table,
      });
    }
}
