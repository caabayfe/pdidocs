if (current.changes())
  current.update();
var url = GlideappCatalogURLGenerator.getItemBaseURLFromGR(current);
gs.setRedirect(url + "");
