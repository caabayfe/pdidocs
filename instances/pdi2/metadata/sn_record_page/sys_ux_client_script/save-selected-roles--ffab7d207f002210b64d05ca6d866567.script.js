/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('alertState', {
        showAlert: true,
        alertType: 'positive',
        message: await helpers.translate('Save in Progress..')
    });

    const ids = api.state.selectedChoices.flat().map(item => item.id);
    const mutationQuery = `
        mutation ConfigureSecurity(
            $table: String!,
            $field: String!,
            $ruleId: String,
            $operation: String!,
            $selectedRoles: [String!]!
        ) {
            GlideConfigureSecurityMutation_Mutation {
            configureSecurityMutation(
                table: $table,
                field: $field,
                ruleId: $ruleId,
                operation: $operation,
                selectedRoles: $selectedRoles
            ) {
                saved
            }
        }
        }
    `;
    const requestBody = {
        query: mutationQuery,
        variables: {
            table: api.context.props.table,
            field: api.context.props.field,
            ruleId: api.state.ruleId,
            operation: api.state.selectedOperation,
            selectedRoles: ids
        }
    };

    const {
        response: {
            data,
            errors
        }
    } = await helpers.snHttp(
        '/api/now/graphql', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
    );

    if (errors && errors.length > 0) {
        api.setState('alertState', {
            showAlert: true,
            alertType: 'high',
            message: await helpers.translate('There is some error in processing your request')
        });
    } else if (data.GlideConfigureSecurityMutation_Mutation.configureSecurityMutation.saved) {
        api.setState('alertState', {
            showAlert: true,
            alertType: 'positive',
            message: await helpers.translate('Save complete')
        });
    }
}
