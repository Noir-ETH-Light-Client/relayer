import { Request, Response } from "express";
import LightClientStoreModel from "./models/LightClientStore.js";
import LightClientUpdateModel from "./models/LightClientUpdate.js";
import { LightClientStoreObject, LightClientUpdateObject } from "eth-lc-lib";

export async function getLCStore(req: Request, res: Response) {
    try {
        let lcStorageModel = await LightClientStoreModel.findOne();
        let lcStorageObject: LightClientStoreObject = lcStorageModel as LightClientStoreObject;
        res.send(lcStorageObject);
    } catch (err: any) {
        res.send(err);
        return;
    }
}

export async function getLCUpdate(req: Request, res: Response) {
    try {
        var { page } = req.params;
        let lcUpdateModels = await LightClientUpdateModel.find().skip((parseInt(page) - 1) * 5).limit(5).sort({ $natural: -1 });
        let lcUpdateObjects: LightClientUpdateObject[] = lcUpdateModels.map(e => e as LightClientUpdateObject);
        res.send(lcUpdateObjects);
    } catch (err: any) {
        res.send(err);
        return;
    }
}