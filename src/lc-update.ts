import { BeaconAPI, Field, LightClientStore, LightClientStoreObject, LightClientUpdate } from "eth-lc-lib";
import MetaDataModel from "./models/MetaData.js";
import LightClientStoreModel from "./models/LightClientStore.js";
import LightClientUpdateModel from "./models/LightClientUpdate.js";
import logger from "./logger.js";


export async function lcUpdate() {

    const beaconAPI = new BeaconAPI();
    const genesis = await beaconAPI.downloadGenesisData();
    let genesisValidatorsRoot = Field.fromSSZ(
        genesis.data.data.genesis_validators_root
    );

    let metaData = await MetaDataModel.findOne();
    if (!metaData) {
        metaData = new MetaDataModel({
            period: 700
        });
        await metaData.save();
    }

    let lcUpdates: any = await beaconAPI.downloadLCUpdates(metaData.period);
    let lcStorageModel = (await LightClientStoreModel.find().limit(1).sort({ $natural: -1 }))[0];
    let lcStorageObject: LightClientStoreObject = lcStorageModel as LightClientStoreObject;

    let lcStorage = LightClientStore.fromObject(lcStorageObject);

    for (let i = 0; i < lcUpdates.data.length; i++) {
        try {
            const update = lcUpdates.data[i];
            const lcUpdate = LightClientUpdate.fromObject(update.data);
            lcStorage.processLCUpdate(lcUpdate, true, genesisValidatorsRoot);

            const accepted_lc_update = new LightClientUpdateModel({
                ...lcUpdate.object
            })
            await accepted_lc_update.save();
        } catch (error) {
            logger.error(error)
        }

    }
    metaData.period = metaData.period + 128;

    lcStorageObject = lcStorage.object;
    lcStorageModel.overwrite(lcStorageObject);
    await lcStorageModel.save();

    await metaData.save();
    logger.info("lc update success at " + metaData.period)

}
