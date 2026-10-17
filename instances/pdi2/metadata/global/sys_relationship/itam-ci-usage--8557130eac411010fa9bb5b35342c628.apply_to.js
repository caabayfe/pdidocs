var gr = new GlideRecord('itam_licensing_resource_counts');
gr.addQuery('application', [SAMLicensingUtility.SAM_APP, SAMLicensingUtility.CI_APP,SAMLicensingUtility.SAM_ENT_APP]);
gr.query(); 
answer = gr.hasNext();
