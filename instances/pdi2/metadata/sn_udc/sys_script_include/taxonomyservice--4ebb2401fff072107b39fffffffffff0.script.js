/**
 * Service class responsible for handling operations related to taxonomy.
 * Provides methods to manage and retrieve taxonomy data.
 */
class TaxonomyService {
	static type = 'TaxonomyService';

	/**
	 * Retrieves the details of a taxonomy.
	 *
	 * @return the taxonomy details
	 */
	static getTaxonomyDetails(fileTable, fileSysId) {
		try {
			if (!fileTable || !fileSysId) throw 'Invalid input parameters';

			const fileDetails = FileTaxonomy.getFileDetails({
				fileTable,
				fileSysId,
			});

			if (!fileDetails || !fileDetails.file) throw UDCConstants.errors.FILE_DOES_NOT_EXISTS;

			return {
				file: {
					label: fileDetails.file.label,
					name: fileDetails.file.name,
					type: fileDetails.file.type,
					icon: fileDetails.icon,
				},
			};
		} catch (e) {
			gs.error(e);
			return null;
		}
	}
}
