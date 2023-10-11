import mongoose from "mongoose";
import { BeaconHeaderObject, ExecutionPayloadHeaderObject, LightClientHeaderObject } from "eth-lc-lib";

const BeaconHeaderModel = new mongoose.Schema<BeaconHeaderObject>({
    slot: String,
    proposer_index: String,
    parent_root: String,
    state_root: String,
    body_root: String
})

const ExecutionPayloadHeaderModel = new mongoose.Schema<ExecutionPayloadHeaderObject>({
    parent_hash: String,
    fee_recipient: String,
    state_root: String,
    receipts_root: String,
    logs_bloom: String,
    prev_randao: String,
    block_number: String,
    gas_limit: String,
    gas_used: String,
    timestamp: String,
    extra_data: String,
    base_fee_per_gas: String,
    block_hash: String,
    transactions_root: String,
    withdrawals_root: String
})

export const LightClientHeaderModel = new mongoose.Schema<LightClientHeaderObject>({
    beacon: {
        type: BeaconHeaderModel,
        require: true
    },
    execution: ExecutionPayloadHeaderModel,
    execution_branch: [String]
}, { strict: false });


