var t = data;
var rec = $sp.getRecord();
var articleGR = rec;
//if m2m table get publication record
if (articleGR.getRecordClassName()  == "sn_publications_publication_contact_m2m")
	articleGR = rec.publication.getRefRecord();

var recordIsValid = articleGR.isValidRecord();
var canReadArticle = articleGR.canRead();
t.isvalid = recordIsValid && canReadArticle;

if (canReadArticle) {
	t.short_description = articleGR.getValue('short_description');
	t.text = articleGR.getValue('text');
	t.number = articleGR.getValue('number');
	
	//update pub as viewed
	var gr = new GlideRecord("sn_publications_publication_contact_m2m");
	gr.addQuery("publication", articleGR.getUniqueValue());
	gr.addQuery("user", gs.getUserID());
	gr.query();
	if(gr.next()) {
		gr.setValue("viewed_article", true);
		gr.update();
	}
	
}
