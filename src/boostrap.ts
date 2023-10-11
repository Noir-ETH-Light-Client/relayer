import { BeaconHeaderObject, BeaconAPI, LightClientBootstrap, LightClientHeader, LightClientStore, constants } from "eth-lc-lib";
import LightClientStoreModel from "./models/LightClientStore.js";


export async function boostrap() {
    const beaconAPI = new BeaconAPI();
    let lcUpdates = await beaconAPI.downloadLCUpdates(700);

    const update = lcUpdates.data[0];
    const beaconObj = update.data.attested_header.beacon as BeaconHeaderObject;
    const slot = beaconObj.slot;
    const bootstrapState = (await beaconAPI.downloadBeaconState(slot))?.data;
    const bootstrapLCHeader = new LightClientHeader(
        {
            beacon: bootstrapState.data.latest_block_header,
            execution_branch: ["0x0", "0x0", "0x0", "0x0"]
        }
    );
    const currentSyncCommitteeBranch = new Array(constants.SYNC_COMMITTEES_DEPTH);
    const bootstrap = new LightClientBootstrap(
        bootstrapLCHeader,
        bootstrapState.data.current_sync_committee,
        currentSyncCommitteeBranch
    );
    const lcStorage = LightClientStore.bootstrap(bootstrap).object;
    const lc_store = new LightClientStoreModel({
        sync_committees: lcStorage.sync_committees,
        best_valid_updates: lcStorage.best_valid_updates,
        finalized_header: lcStorage.finalized_header,
        optimistic_header: lcStorage.optimistic_header,
        max_active_participants: lcStorage.max_active_participants
    })

    await lc_store.save()
}
