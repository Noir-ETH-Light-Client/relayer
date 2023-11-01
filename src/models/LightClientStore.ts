import mongoose from "mongoose";
import { LightClientHeaderModel } from "./LightClientHeader.js";
import { SyncCommitteeModel } from "./SyncCommittee.js";
import { LightClientStoreObject } from "eth-lc-lib";
import { LightClientUpdateModel } from "./LightClientUpdate.js";

const LightClientStoreModel = new mongoose.Schema<LightClientStoreObject>({
    sync_committees: {
        type: Map,
        of: SyncCommitteeModel
    },
    best_valid_updates: {
        type: Map,
        of: LightClientUpdateModel
    },
    finalized_header: LightClientHeaderModel,
    optimistic_header: LightClientHeaderModel,
    max_active_participants: {
        type: Map,
        of: Number
    }
});


export default mongoose.model("LightClientStoreModel", LightClientStoreModel);
