addLoadEvent(redirectPubilcation);

function redirectPubilcation() {
    document.location.href = "${jvar_portal}?id=publication&table=sn_publications_publication&sys_id=" + "${RP.getParameterValue('sysparm_pub_id')}";
}
