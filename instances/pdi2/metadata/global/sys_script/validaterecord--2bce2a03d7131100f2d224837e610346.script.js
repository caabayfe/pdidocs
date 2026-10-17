gs.addErrorMessage(gs.getMessage('Catalog: [{0}] already has view: [{1}]', [SNC.Catalog.get(current.sc_catalog).getTitle(), current.sys_portal_page.title]));
current.setAbortAction(true);
