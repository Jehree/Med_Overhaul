/* eslint-disable @typescript-eslint/brace-style */
import { DependencyContainer } from "tsyringe";
import { InitStage, InstanceManager } from "./instance_manager";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { JehreeUtilities } from "./jehree_utils";
import { JMOMedicalConfig} from "./custom_types/medical_item_types";
import { JMOConfig } from "./custom_types/config_types";
import { MedEffectsEdits } from "./med_effects_edits";
import { JMOBuffsConfig } from "./custom_types/stimulator_buffs_types";
import { DisableSoftskills } from "./disable_softskills";
import { CustomCases } from "./custom_cases";
import { JMOCaseConfig } from "./custom_types/custom_case_types";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { BarterEdits } from "./barter_edits";
import { JMOBarterConfig } from "./custom_types/barter_types";
import { UnpackableMeds } from "./unpackable_meds";



class Mod implements IPostDBLoadMod, IPreAkiLoadMod
{   
    private _inst:InstanceManager = new InstanceManager
    private _medEffectsEdits:MedEffectsEdits = new MedEffectsEdits
    private _disableSoftSkills:DisableSoftskills = new DisableSoftskills
    private _customCases:CustomCases = new CustomCases
    private _barterEdits:BarterEdits = new BarterEdits
    private _unpackableMeds:UnpackableMeds = new UnpackableMeds

    private config:JMOConfig
    private medsConfig:JMOMedicalConfig
    private buffsConfig:JMOBuffsConfig
    private casesConfig:JMOCaseConfig
    private barterConfig:JMOBarterConfig

    initInstances()
    {
        this._medEffectsEdits.init(this._inst)
        this._disableSoftSkills.init(this._inst)
        this._customCases.init(this._inst)
        this._barterEdits.init(this._inst)
        this._unpackableMeds.init(this._inst, this.casesConfig)
    }


    initConfigs()
    {
        this.config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        this.medsConfig = JehreeUtilities.readJsonFile("../db/meds.json5", true) as JMOMedicalConfig
        this.buffsConfig = JehreeUtilities.readJsonFile("../db/stimulator_buffs.json5", true) as JMOBuffsConfig
        this.casesConfig = JehreeUtilities.readJsonFile("../db/cases.json5", true) as JMOCaseConfig
        this.barterConfig = JehreeUtilities.readJsonFile("../db/barters.json5", true) as JMOBarterConfig
    }


    preAkiLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.PRE_AKI_LOAD)
        this.initInstances()
        this.initConfigs()
        this._inst.log("Pre AKI Loading...", LogTextColor.MAGENTA)

        if (this.config.disable_softskills){
            this._disableSoftSkills.registerSoftskillDisableRoutes()
            this._inst.log("disable_softskills enabled", LogTextColor.YELLOW, true)
        }

        this._unpackableMeds.replaceOpenRandomLootContainerMethod(container)

        this._inst.log("Pre AKI Loaded!", LogTextColor.MAGENTA)
    }


    postDBLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.POST_DB_LOAD)
        this.initInstances()
        this._inst.log("Post DB Loading...", LogTextColor.MAGENTA)

        this._medEffectsEdits.pushCustomStimulatorBuffs(this.buffsConfig, this.config.healthrate_multiplier, this._inst.dbGlobals)
        this._medEffectsEdits.updateDatabaseMeds(this.config, this.medsConfig)
        this._customCases.addCustomCasesToItemDatabase(this.casesConfig)
        this._barterEdits.addNewBartersToTraderAssorts(this.barterConfig)

        this._inst.log("Post DB Loaded!", LogTextColor.MAGENTA)
    }
}

module.exports = { mod: new Mod() }