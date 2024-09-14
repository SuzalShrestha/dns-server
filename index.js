const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');
const dnsPacket = require('dns-packet');
const db = {
    'sujalshrestha.tech': {
        type: 'A',
        data: '1.2.3.4',
    },
    'google.com': {
        type: 'A',
        data: '8.8.8.8',
    },
    'dub.sh/sujal': {
        type: 'CNAME',
        data: 'sujalshrestha.tech',
    },
};
server.on('message', (msg, rinfo) => {
    const request = dnsPacket.decode(msg);
    const ipFromDb = db[request.questions[0].name];
    const ans = dnsPacket.encode({
        type: 'response',
        id: request.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: request.questions,
        answers: [
            {
                type: ipFromDb.type,
                class: 'IN',
                name: request.questions[0].name,
                data: ipFromDb.data,
            },
        ],
    });
    server.send(ans, rinfo.port, rinfo.address);
    console.log('Request:', request.questions[0].name);
});
server.bind(53, () => console.log('DNS Server is running on port 53'));
