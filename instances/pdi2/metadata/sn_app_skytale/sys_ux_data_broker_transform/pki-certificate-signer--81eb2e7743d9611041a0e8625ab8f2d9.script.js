function transform(input) {
	return new ProxyPKISigner().signCertificate(input.csr);
}
