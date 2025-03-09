import { Keyring } from "@polkadot/keyring";
import { Buffer } from "buffer";
import { useSettingStore } from "./pinia";

const getAccessToken = async () => {
    const settingStore = useSettingStore()
    if (settingStore.user.seed !== null) {
        const keyring = new Keyring();
        const pair = keyring.addFromUri(settingStore.user.seed);

        const sign = pair.sign(pair.address);
        const signHex = '0x' + Buffer.from(sign).toString('hex');

        const access_token = Buffer.from(`sub-${pair.address}:${signHex}`).toString('base64');

        settingStore.user.token = access_token;

        return `Bearer ${access_token}`
    }
    return null
}

export {
    getAccessToken,
}