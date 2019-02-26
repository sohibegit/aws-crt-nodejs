import * as io from '../ts/io';
import * as mqtt from '../ts/mqtt';
import { Hash } from '../ts/crypto';

console.log(io.is_alpn_available());

const test_topic = "test";

async function main() {
    let bootstrap = new io.ClientBootstrap();
    let tls_opt = io.TlsContextOptions.create_client_with_mtls("iot-certificate.pem.crt", "iot-private.pem.key")
    tls_opt.override_default_trust_store(undefined, "AmazonRootCA1.pem")
    tls_opt.alpn_list = "x-amzn-mqtt-ca"
    let tls_ctx = new io.ClientTlsContext(tls_opt);
    let client = new mqtt.Client(bootstrap, tls_ctx);

    let conn = new mqtt.Connection(client);

    try {
        const session_present = await conn.connect({
            client_id: "js-client",
            host_name: "a1ba5f1mpna9k5-ats.iot.us-east-1.amazonaws.com",
            port: io.is_alpn_available() ? 443 : 8883,
            keep_alive: 6000
        });
        console.log("connected", session_present);

        /* Subscribe, publish on suback, and resolve on message received */
        await new Promise(resolve => {
            conn.subscribe(test_topic, mqtt.QoS.AtLeastOnce, (topic, payload) => {
                console.log("Got message, topic:", topic, "payload:", payload);
                resolve();
            }).then(sub_req => {
                console.log("subscribed");
                conn.publish(test_topic, "Testing from JS client", mqtt.QoS.AtLeastOnce)
            });
        });

        await conn.unsubscribe(test_topic);
        console.log("unsubscribed");

        await conn.disconnect();
        console.log("disconnected");
    } catch (e) {
        console.error(e);
    }
}

//main()

const to_hash = 'ABC';
let md5 = Hash.md5();
md5.update(to_hash);
console.log('Hash of', to_hash, ':', md5.digest());
