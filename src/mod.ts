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

    initInstanceManagers()
    {
        this._medEffectsEdits.initInstanceManager(this._inst)
        this._disableSoftSkills.initInstanceManager(this._inst)
        this._customCases.initInstanceManager(this._inst)
        this._barterEdits.initInstanceManager(this._inst)
        this._unpackableMeds.initInstanceManager(this._inst)
    }


    preAkiLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.PRE_AKI_LOAD)
        this.initInstanceManagers()

        this._inst.log("Pre AKI Loading...", LogTextColor.MAGENTA)

        const config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        
        if (config.disable_softskills){
            this._disableSoftSkills.registerSoftskillDisableRoutes()
            this._inst.log("disable_softskills enabled", LogTextColor.YELLOW, true)
        }

        this._unpackableMeds.replaceOpenRandomLootContainerMethod(container)

        this._inst.log("Pre AKI Loaded!", LogTextColor.MAGENTA)
    }


    postDBLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.POST_DB_LOAD)
        this.initInstanceManagers()

        this._inst.log("Post DB Loading...", LogTextColor.MAGENTA)

        const config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        const medsConfig = JehreeUtilities.readJsonFile("../db/meds.json5", true) as JMOMedicalConfig
        const buffsConfig = JehreeUtilities.readJsonFile("../db/stimulator_buffs.json5", true) as JMOBuffsConfig
        const casesConfig = JehreeUtilities.readJsonFile("../db/cases.json5", true) as JMOCaseConfig
        const barterConfig = JehreeUtilities.readJsonFile("../db/barters.json5", true) as JMOBarterConfig

        this._medEffectsEdits.pushCustomStimulatorBuffs(buffsConfig, config.healthrate_multiplier, this._inst.dbGlobals)
        this._medEffectsEdits.updateDatabaseMeds(config, medsConfig)
        this._customCases.addCustomCasesToItemDatabase(casesConfig)
        this._barterEdits.addNewBartersToTraderAssorts(barterConfig)

        this._inst.log("Post DB Loaded!", LogTextColor.MAGENTA)
    }
}

module.exports = { mod: new Mod() }