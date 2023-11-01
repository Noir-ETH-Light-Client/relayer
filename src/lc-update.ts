import { BeaconAPI, Field, LightClientStore, LightClientStoreObject, LightClientUpdate } from "eth-lc-lib";
import MetaDataModel from "./models/MetaData.js";
import LightClientStoreModel from "./models/LightClientStore.js";
import LightClientUpdateModel from "./models/LightClientUpdate.js";
import logger from "./logger.js";
import { provider, contract } from "./index.js";

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
    if (lcUpdates.data.length == 0) {
        logger.info("lc update at " + metaData.period + " is empty");
        return;
    }
    let lcStorageModel = (await LightClientStoreModel.find().limit(1).sort({ $natural: -1 }))[0];
    let lcStorageObject: LightClientStoreObject = lcStorageModel as LightClientStoreObject;

    let lcStorage = LightClientStore.fromObject(lcStorageObject);

    for (let i = 0; i < lcUpdates.data.length; i++) {
        try {
            const update = lcUpdates.data[i];
            const lcUpdate = LightClientUpdate.fromObject(update.data);
            lcStorage.processLCUpdate(lcUpdate, true, genesisValidatorsRoot);

            const accepted_lc_update = new LightClientUpdateModel({
                ...lcUpdate.object,
                is_on_contract: false
            })
            if (accepted_lc_update?.signature_slot != null) metaData.period = Math.max(metaData.period, Math.floor(Number(accepted_lc_update.signature_slot) / 8192) + 1)
            await accepted_lc_update.save();
        } catch (error) {
            logger.error(error)
        }

    }

    lcStorageObject = lcStorage.object;
    lcStorageModel.overwrite(lcStorageObject);
    await lcStorageModel.save();

    await metaData.save();
    logger.info("lc update success at " + metaData.period)

}


export async function updateStatusLcUpdate() {
    let filter = contract.filters.LCUpdateSynced();
    let blockNumber = Number(await provider.getBlockNumber());
    var data = await contract.queryFilter(filter, blockNumber - 10, blockNumber);
    data.map(e => e.args?.summary?.signatureSlot?.toString()).forEach(async (e) => {
        let lcUpdate = await LightClientUpdateModel.findOne({ signature_slot: e });
        if (lcUpdate != null) {
            lcUpdate.is_on_contract = true;
            lcUpdate.save();
        }
    })

}
