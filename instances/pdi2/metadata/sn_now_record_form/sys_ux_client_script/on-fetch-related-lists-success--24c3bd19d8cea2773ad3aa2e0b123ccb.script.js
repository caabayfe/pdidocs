/**
 * Fetch related lists success handler
 */
function onDemandFetchRelatedListsSuccess ({ api, event }) {

    api.setState('relatedListsStatus', 'fetched');
    // since now we have fetched related lists once, continue
    // to fetch lists when CSDB fetches
    api.setState('skipRelatedListEvalCSDB', false);

    const relatedLists = event.payload?.data?.output?.data?.GlideLayout_Query?.formLayout?.relatedLists || [];
    api.data.glide_form_1?.setRelatedLists({ relatedLists });

    api.emit("CTRL_RECORD#RELATED_LIST_FETCH_COMPLETED");
}
