import React from 'react';
import {connect} from 'react-redux';
import {currentUser} from "state/selectors/app";
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import CircularProgress from "@material-ui/core/CircularProgress";
import Credential from "v2/evernym/Credential";
import axios from 'axios';
import {draftsChange} from "state/actions";
import {draftsSubmit} from "state/actions";
import {selectResource} from "state/selectors/resources";

const vcxClient = 'http://cms.d:5000';

const mapStateToProps = (store, props) => {
    const userId = currentUser(store).id;
    const evernymQrCodeUrl = `${vcxClient}/connect?id=${userId}`;
    const schema = store.data['db.types.byName']['Education certificate'];
    const schemaFields = Object.keys(schema.fields_index).filter(field => {
        return field !== 'subtype' && field !== 'proof';
    });
    const type = ['db',store.context.view].join('.');
    const id = store.context.id;
    const data = selectResource(store, type, id);

    return {
        type,
        id,
        data,
        userId,
        evernymQrCodeUrl,
        schemaFields,
        proof: data.proof ? JSON.parse(data.proof) : {}
    }
};

const mapDispatchToProps = {
    onChange: draftsChange,
    onSubmit: draftsSubmit
};

class EvernymConnectedForm extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            proofStatus: {
                state: 0,
                data: {}
            }
        };
    }

    componentDidMount() {
        this.socket = window.io(vcxClient);
        this.socket.on('proofRequest', (evt) => {
            this.setState({proofStatus: {state: 1}});
        });
        this.socket.on('proofWaiting', () => {
            this.setState({proofStatus: {state: 2}});
        });
        this.socket.on('proofResult', (evt) => {
            console.log(evt);
            this.setState({proofStatus: {state: 3, data: evt}});
            this.applyProof(evt);
        });
        this.socket.on('proofException', () => {
            this.setState({proofStatus: {status: -1}});
        })
    }

    componentWillUnmount() {
        delete this.socket;
    }

    applyProof = (data) => {
        const { type, id, onChange, onSubmit } = this.props;
        onChange([type, id], {
            ...data.fields,
            proof: JSON.stringify(data.proof)
        });
        onSubmit(type, id);
    };

    requestProof = () => {
        const { userId, schemaFields } = this.props;

        let requestData = {
            fields: schemaFields,
            name: 'Education certificate'
        };

        this.props.onSubmit(this.props.type, this.props.id);

        axios({
            url: `${vcxClient}/proof`,
            method: 'POST',
            data: {
                id: userId,
                ...requestData
            }
        });
    };

    open = () =>this.setState({open: true});

    close = () => this.setState({open: false});

    render() {
        const { schemaFields, userId, evernymQrCodeUrl, data } = this.props;
        const { proofStatus, open } = this.state;
        const proofStateId = proofStatus.state;

        return (<div>
            <Button onClick={this.open}>Connect to connect.me</Button>
            <Button onClick={this.requestProof}>Request proof {proofStateId}</Button>

            { proofStateId === 1 ? <div>
                <CircularProgress />
                Sending proof request
                </div> : null }

            { proofStateId === 2 ? <div>
                <CircularProgress />
                Waiting for proof request to be accepted
            </div> : null }

            { proofStateId === 3 ? <div>
                PROOF ACCEPTED
            </div> : null }

            { proofStateId === -1 ? <div>
                Something went wrong
            </div> : null }

            <Credential
                resource={this.props.type}
                id={this.props.id} />

            <Dialog open={open} onClose={this.close}>
                { open ? <img src={evernymQrCodeUrl} alt={'qr code'} /> : null }
            </Dialog>
        </div>);
    }

}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EvernymConnectedForm);