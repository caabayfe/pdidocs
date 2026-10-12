/**
 * Fetch related lists
 */
function onDemandFetchRelatedLists ({ api }) {
    const inputProps = {
      table: api.context.props?.inputTable,
      sysId: api.context.props?.inputSysId,
      view: api.context.props?.view,
      query: api.context.props?.query,
    };
    const payload = api.data?.glide_form_1?.nowRecordFormBlob?.relatedListFetchConfig || inputProps;
    api.data.form_related_list_fetcher.execute(payload);

    api.emit("CTRL_RECORD#RELATED_LIST_FETCH_STARTED");
}
