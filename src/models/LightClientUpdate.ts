import mongoose from "mongoose";
import { LightClientHeaderModel } from "./LightClientHeader.js";
import { SyncCommitteeModel } from "./SyncCommittee.js";
import { LightClientUpdateObject } from "eth-lc-lib";

export const LightClientUpdateModel = new mongoose.Schema<LightClientUpdateObject>({
    attested_header: LightClientHeaderModel,
    next_sync_committee: SyncCommitteeModel,
    next_sync_committee_branch: [String],
    finalized_header: LightClientHeaderModel,
    finality_branch: [String],
    sync_aggregate: {
        sync_committee_bits: String,
        sync_committee_signature: String
    },
    signature_slot: String
});



export default mongoose.model("LightClientUpdateModel", LightClientUpdateModel);