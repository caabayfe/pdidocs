if (current.table_name == 'sc_wizard_feedback' || isCatalogBuilderFeedBackAssociated(current.sys_id + ""))
    answer = true;
else
    answer = false;

function isCatalogBuilderFeedBackAssociated(attachId) {
    return ["af7ce13487102010c84e4561d5cb0b14", "d3b4bc3087002010c84e4561d5cb0bbe",
        "95875513ebd31010e0ef83c45e5228dc", "64fbbdb273121110547a54eb7df6a74f",
        "1122555feb931010e0ef83c45e522885", "a0579ddfeb931010e0ef83c45e5228bd",
        "22947c3087002010c84e4561d5cb0bbb", "ddc81d13ebd31010e0ef83c45e52289a",
        "d544a99987102010c84e4561d5cb0bb3", "fd1655dfeb931010e0ef83c45e52286f",
        "6b691553ebd31010e0ef83c45e522856", "141e68de531211106a42ddeeff7b12c0",
		"a3553f88ffa10210b229ffffffffffa8"].indexOf(attachId) > -1;
}
