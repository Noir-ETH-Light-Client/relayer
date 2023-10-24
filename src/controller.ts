import { Request, Response } from "express";
import LightClientStoreModel from "./models/LightClientStore.js";
import LightClientUpdateModel from "./models/LightClientUpdate.js";
import { LightClientStoreObject, LightClientUpdateObject } from "eth-lc-lib";
import LightClientProofModel from "./models/LightClientProof.js";
import { generateLcProof } from "./lc-prove.js";
import { updateStatusLcUpdate } from "./lc-update.js";


export async function getLCStore(req: Request, res: Response) {
    try {
        let lcStorageModel = await LightClientStoreModel.findOne();
        let lcStorageObject: LightClientStoreObject = lcStorageModel as LightClientStoreObject;
        res.send(lcStorageObject);
    } catch (err: any) {
        res.send({ error: err });
        return;
    }
}

export async function getLCUpdates(req: Request, res: Response) {
    try {
        var { signatureSlot } = req.params;

        await updateStatusLcUpdate();

        // get current update
        let lcUpdateModel = await LightClientUpdateModel.findOne({ signature_slot: signatureSlot })


        // get pre update
        let lessLcUpdateModel = await LightClientUpdateModel.find({
            signature_slot: {
                $lt: signatureSlot
            }
        })
            .limit(3)
            .sort({ signature_slot: -1 })

        /// get suffix update
        let greaterLcUpdateModel = await LightClientUpdateModel.find({
            signature_slot: {
                $gt: signatureSlot
            }
        })
            .limit(3)
            .sort({ signature_slot: 1 })

        /// get oldest
        let oldestUpdateModel = await LightClientUpdateModel.find()
            .limit(1)
            .sort({ signature_slot: 1 })

        // get newest
        let newestLcUpdateModel = await LightClientUpdateModel.find()
            .limit(1)
            .sort({ signature_slot: -1 })

        res.send({
            preType: lessLcUpdateModel.length,
            sufType: greaterLcUpdateModel.length,
            oldest: oldestUpdateModel.length == 0 ? null : oldestUpdateModel[0] as LightClientUpdateObject,
            less: lessLcUpdateModel.length == 0 ? null : lessLcUpdateModel[0] as LightClientUpdateObject,
            current: lcUpdateModel as LightClientUpdateObject,
            greater: greaterLcUpdateModel.length == 0 ? null : greaterLcUpdateModel[0] as LightClientUpdateObject,
            newest: newestLcUpdateModel.length == 0 ? null : newestLcUpdateModel[0] as LightClientUpdateObject
        });
    } catch (err: any) {
        res.send({ error: err });
        return;
    }
}


export async function getLCProof(req: Request, res: Response) {
    try {
        var { lcUpdateId } = req.params;
        let lcProof = await LightClientProofModel.findOne({ lc_update_id: lcUpdateId });
        if (lcProof == null) {
            lcProof = await generateLcProof(lcUpdateId);
        }
        res.send(lcProof);
    } catch (err: any) {
        res.send({ error: err });
        return;
    }
}