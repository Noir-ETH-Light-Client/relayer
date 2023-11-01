import { BeaconAPI, Field, LightClientUpdate, LightClientUpdateObject } from "eth-lc-lib";
import logger from "./logger.js";
import { convertObjectUint8ArrayToBuffer } from "./utils.js";
import LightClientUpdateModel from "./models/LightClientUpdate.js";
import LightClientProofModel from "./models/LightClientProof.js";

export async function generateLcProof(lcUpdateId: string) {
    const beaconAPI = new BeaconAPI();
    const genesis = await beaconAPI.downloadGenesisData();
    let genesisValidatorsRoot = Field.fromSSZ(
        genesis.data.data.genesis_validators_root
    );

    const lcUpdateObject: LightClientUpdateObject = await LightClientUpdateModel.findById(lcUpdateId) as LightClientUpdateObject;
    const lcUpdate = LightClientUpdate.fromObject(lcUpdateObject);

    var lcProofModel = await lcUpdate.validateLCUpdateContractData(
        genesisValidatorsRoot
    )

    const lcProof = convertObjectUint8ArrayToBuffer(lcProofModel);

    const lc_proof = new LightClientProofModel({
        lc_update_id: lcUpdateId,
        finality_proof: {
            sliced_proof: lcProof[0],
            public_inputs: lcProof[1],
        },
        next_sync_committee_proof: {
            sliced_proof: lcProof[2],
            public_inputs: lcProof[3],
        },
        lc_update_proof: {
            sliced_proof: lcProof[4],
            public_inputs: lcProof[5],
        },
        next_pubkeys: lcProof[6]
    })


    await lc_proof.save();

    logger.info("lc generate proof success for lc update " + lcUpdateId);
    return lc_proof;
}


