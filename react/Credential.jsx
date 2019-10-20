import React from 'react';
import {connect} from 'react-redux';
import {selectResource} from "state/selectors/resources";
import Card from '@material-ui/core/Card';
import {Icon} from "@material-ui/core";
import ResourceActions from "containers/ResourceActions";
import ItemActions from "v2/items/ItemActions";
import {resourceAction} from "state/actions";

const mapStateToProps = (store, props) => {
    const data = selectResource(store, props.resource, props.id);
    const schema = selectResource(store, 'db.types', data.subtype);
    const schemaFields = schema.fields_index ? Object.keys(schema.fields_index).filter(field => {
        return field !== 'subtype' && field !== 'proof';
    }) : [];
    let proof = data.proof ? JSON.parse(data.proof) : null;
    if (proof) proof = proof.identifiers[0];
    return {
        name: schema.name,
        data,
        fields: schemaFields,
        proof
    }
};

const mapDispatchToProps = {
    onActionRequest: resourceAction,
};

class Credential extends React.Component {

    handleAction = (type) => {
        this.props.onActionRequest(type, this.props.resource, this.props.id);
    };

    render() {
        const { onClick, name, fields, data, proof } = this.props;
        return (<Card onClick={onClick} style={{ padding: '1rem', position: 'relative' }}>
            <div style={{ display: 'flex' }}>
                <div>
                    <Icon>verified_user</Icon>
                </div>
                <div style={{ fontSize: '1.2em' }}>{name}</div>
            </div>
            { proof ? <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                {proof.cred_def_id}
            </div> : null }
            {fields.map(field => {
                return <div style={{ display: 'flex' }}>
                    <div style={{ width: '160px', opacity: 0.5 }}>{field}</div>
                    <div>{data[field]}</div>
                </div>
            })}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <ItemActions
                    actions="db.credentials" resource={'db.credentials'}
                    onActionRequest={this.handleAction}
                />
            </div>
        </Card>);
    }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Credential);