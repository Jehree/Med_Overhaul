"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const medsConfig = __importStar(require("../db/meds.json"));
const buffsConfig = __importStar(require("../db/buffs.json"));
const config = __importStar(require("../config/config.json"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class Mod {
    constructor() {
        this.modPath = path.normalize(path.join(__dirname, ".."));
    }
    preAkiLoad(container) {
        const staticRouterModService = container.resolve("StaticRouterModService");
        const saveServer = container.resolve("SaveServer");
        //raid start
        staticRouterModService.registerStaticRouter("On_Raid_Start_Med_Overhaul", [{
                url: "/client/raid/configuration",
                action: (url, info, sessionId, output) => {
                    const profile = saveServer.getProfile(sessionId);
                    const lg = container.resolve("WinstonLogger");
                    const profSkills = profile.characters.pmc.Skills.Common;
                    if (config.disable_softskills && profSkills !== undefined) {
                        for (const skill in profSkills) {
                            if (config.softskills_to_disable.includes(profSkills[skill].Id)) {
                                profSkills[skill].Progress = 0;
                            }
                        }
                        lg.log("These skills have been set to level 0:", "magenta");
                        console.log(config.softskills_to_disable);
                    }
                    return output;
                }
            }], "aki");
        //raid end
        staticRouterModService.registerStaticRouter("On_Raid_End_Med_Overhaul", [{
                url: "/client/match/offline/end",
                action: (url, info, sessionId, output) => {
                    const profile = saveServer.getProfile(sessionId);
                    const lg = container.resolve("WinstonLogger");
                    const profSkills = profile.characters.pmc.Skills.Common;
                    if (config.disable_softskills && profSkills !== undefined) {
                        for (const skill in profSkills) {
                            if (config.softskills_to_disable.includes(profSkills[skill].Id)) {
                                profSkills[skill].Progress = 0;
                            }
                        }
                        lg.log("These skills have been set to level 0:", "magenta");
                        console.log(config.softskills_to_disable);
                    }
                    return output;
                }
            }], "aki");
    }
    postDBLoad(container) {
        const databaseServer = container.resolve("DatabaseServer");
        const lg = container.resolve("WinstonLogger");
        const dbTables = databaseServer.getTables();
        const dbItems = dbTables.templates.items;
        const dbGlobabls = dbTables.globals;
        lg.log("Meds Overhaul loading...", "magenta");
        this.pushCustomStimulatorBuffs(dbGlobabls);
        if (config.overhaul_medkits) {
            this.updateMedParams(medsConfig.MEDKITS, dbItems);
            lg.log("Medkit Overhaul enabled!", "green");
        }
        if (config.overhaul_bleed_correction) {
            this.updateMedParams(medsConfig.BLEED_CORRECTION, dbItems);
            lg.log("Bandage and Tourniquet Overhaul enabled!", "green");
        }
        if (config.overhaul_splints) {
            this.updateMedParams(medsConfig.SPLINTS, dbItems);
            lg.log("Splint Overhaul enabled!", "green");
        }
        if (config.overhaul_surgery_kits) {
            this.updateMedParams(medsConfig.SURGERY_KITS, dbItems);
            lg.log("Surgery Kit Overhaul enabled!", "green");
        }
        if (config.overhaul_drugs) {
            this.updateMedParams(medsConfig.DRUGS, dbItems);
            lg.log("Drugs Overhaul enabled!", "green");
        }
        if (config.overhaul_stims) {
            this.updateMedParams(medsConfig.STIMS, dbItems);
            lg.log("Stims Overhaul enabled!", "green");
        }
        lg.log("Meds Overhaul loaded!", "magenta");
    }
    pushCustomStimulatorBuffs(dbGlobals) {
        const newBuffs = [
            buffsConfig.MEDKITS,
            buffsConfig.INJURY_CORRECTION,
            buffsConfig.DRUGS,
            buffsConfig.STIMS
        ];
        for (const buffCat of newBuffs) {
            for (const buffKey in buffCat) {
                const thisBuff = buffCat[buffKey];
                for (const effect in thisBuff) {
                    if (thisBuff[effect].BuffType === "HealthRate") {
                        thisBuff[effect].Value *= config.healthrate_multiplier;
                    }
                }
                dbGlobals.config.Health.Effects.Stimulator.Buffs[buffKey] = thisBuff;
            }
        }
    }
    updateMedParams(meds, dbItems) {
        for (const med in meds) {
            const thisMedItem = meds[med];
            const medId = thisMedItem.item_id;
            const medDbItem = dbItems[medId];
            for (const param in thisMedItem) {
                if (param !== "item_id") {
                    medDbItem._props[param] = thisMedItem[param];
                }
            }
        }
    }
    logMedsForConfig(dbItems) {
        const medParents = [
            "5448f39d4bdc2d0a728b4568",
            "5448f3a64bdc2d60728b456a",
            "5448f3ac4bdc2dce718b4569",
            "5448f3a14bdc2d27728b4569" //drugs
        ];
        const jsonData = {};
        for (const item in dbItems) {
            if (medParents.includes(dbItems[item]._parent)) {
                const thisItem = dbItems[item];
                const thisItemProps = thisItem._props;
                jsonData[thisItem._name] = {
                    "item_id": thisItem._id,
                    "medUseTime": thisItemProps.medUseTime,
                    "MaxHpResource": thisItemProps.MaxHpResource,
                    "hpResourceRate": thisItemProps.hpResourceRate,
                    "StackMaxSize": thisItemProps.StackMaxSize,
                    "StimulatorBuffs": thisItemProps.StimulatorBuffs,
                    "effects_health": thisItemProps.effects_health,
                    "effects_damage": thisItemProps.effects_damage
                };
            }
        }
        this.fileConstructor(this.modPath + "/config/generated_json.json", jsonData);
    }
    fileConstructor(filePath, fileData) {
        const fileDataJson = JSON.stringify(fileData, null, 4);
        if (!fs.existsSync(`${filePath}`)) {
            fs.writeFileSync(`${filePath}`, fileDataJson);
        }
    }
}
module.exports = { mod: new Mod() };
