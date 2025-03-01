import {Request, Response} from "express";
import {checkSchema} from "express-validator";
import {Pairing, PairingDocument} from "../models/Pairing";
import Cache from "../util/cache";
import config from "../util/config";
import validate from "../util/validate";
import {getErcBalance, getEthBalance} from "../blockchain/eth";
import {TokenDocument, Tokens} from "../models/Tokens";

const cache = Cache.getInstance();

// import {check, validationResult} from "express-validator";
// import logger from "../util/logger";

export const getTokenPairings = async (req: Request, res: Response) => {
    const pairs: PairingDocument[] = await cache.get("pairs", async () => {
        return Pairing.find({}, {_id: false});
    });

    try {
        res.json( { tokens: pairs });
    } catch (e) {
        res.status(500);
        res.send(`Error: ${e}`);
    }
};

export const getTokenValidator = validate(checkSchema({
    token: {
        in: ["params"],
        isString: { 
            errorMessage: "Token must be a string"
        },
        trim: true,
    }
}));

export const getToken = async (req: Request, res: Response) => {
    const token: string = req.params.token;
    const pair: PairingDocument = await cache.get(token, async () => Pairing.find({src_coin: token}, {_id: false}));

    // eslint-disable-next-line @typescript-eslint/camelcase
    //const pair = await Pairing.findOne({src_coin: token});
    if (!pair) {
        res.status(404);
        res.send("Not found");
        return;
    } else {
        res.json({token: pair});
    }
};

export const getSecretTokens = async (req: Request, res: Response) => {
    const tokens: TokenDocument[] = await cache.get("secret_tokens", async () => {
        return Tokens.find({}, {_id: false});
    });

    try {
        res.json( { tokens });
    } catch (e) {
        res.status(500);
        res.send(`Error: ${e}`);
    }
};
