import { Keyring } from "@polkadot/keyring";
import { useUserStore } from "./pinia";
import { Buffer } from "buffer";

const getAccessToken = async () => {
    const userStore = useUserStore()
    if (userStore.seeds !== null) {
        const keyring = new Keyring();
        const pair = keyring.addFromUri(userStore.seeds);

        const sign = pair.sign(pair.address);
        const signHex = '0x' + Buffer.from(sign).toString('hex');

        const access_token = Buffer.from(`sub-${pair.address}:${signHex}`).toString('base64');

        userStore.access_token = access_token;

        return `Bearer ${access_token}`
    }
    return null
}

export {
    getAccessToken,
}