removeInactiveDomain();

function removeInactiveDomain() {
    var domainName = current.name;
    var gr = new GlideRecord("domain_cleanup_queue");
    gr.addQuery("domain", current.getUniqueValue());
    gr.query();
    if (!gr.hasNext())
        return;
    while (gr.next())
        gr.deleteRecord();
    gs.addInfoMessage(gs.getMessage("Domain {0} is removed from Domain Cleanup Queue as the domain is now active", domainName));
    gs.log("Domain Cleanup Queue Table Update: Domain " + domainName + " is removed from Domain Cleanup Queue as the domain is now active");
}
