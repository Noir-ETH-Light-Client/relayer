import mongoose from "mongoose";

const CircuitProof = new mongoose.Schema({
    sliced_proof: [Number],
    public_inputs: [[Number]]
})

const LightClientProofModel = new mongoose.Schema({
    lc_update_id: String,
    finality_proof: CircuitProof,
    next_sync_committee_proof: CircuitProof,
    lc_update_proof: CircuitProof,
    next_pubkeys: [[[Number]]]
});


export default mongoose.model("LightClientProofModel", LightClientProofModel);
