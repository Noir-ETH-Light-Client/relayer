import { SyncCommitteeObject } from "eth-lc-lib";
import mongoose from "mongoose";

export const SyncCommitteeModel = new mongoose.Schema<SyncCommitteeObject>({
    pubkeys: [String],
    aggregate_pubkey: String,
});


