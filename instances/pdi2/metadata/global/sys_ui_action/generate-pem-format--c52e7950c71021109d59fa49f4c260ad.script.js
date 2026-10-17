var PEMFile = new SNC.CertificateValidator().convertPEMFile(current.sys_id);
current.pem_certificate = PEMFile;
current.format = "pem";
current.update();
gs.addInfoMessage(gs.getMessage("PEM format is generated."));
action.setRedirectURL(current);
