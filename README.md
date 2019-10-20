# Vcx connection for Joint

1. Dockerized nodejs credential exchange server build around libvcx and node-vcx-wrapper provided by evernym
2. React ui components in react/

### Prerequisites

Libraries provided by evernym should be placed in `./lib` directory:
- libvcx_0.2.41140129-e0d1c6e_amd64.deb
- libsovtoken_0.9.7_amd64.deb
- node-vcx-wrapper_0.2.41140129-e0d1c6e_amd64.tgz

### Setup
```
npm install
docker-compose up
./provision.sh
```

### Endpoints
`GET http://localhost:5000/connect?id=<account_id>` - create new connection using qr code method
`POST http://localhost:5000/proof` - initialize credential proof exchange workflow

Server uses websockets to communicate with ui.

## Directories
`./data` - connection details for restoring connections
`./indy-data` - indy wallet
