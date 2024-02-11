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



class Mod implements IPostDBLoadMod, IPreAkiLoadMod
{   
    private _inst:InstanceManager = new InstanceManager
    private _medEffectsEdits:MedEffectsEdits = new MedEffectsEdits
    private _disableSoftSkills:DisableSoftskills = new DisableSoftskills

    initInstanceManagers()
    {
        this._medEffectsEdits.initInstanceManager(this._inst)
        this._disableSoftSkills.initInstanceManager(this._inst)
    }

    preAkiLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.PRE_AKI_LOAD)
        this.initInstanceManagers()

        const config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        
        if (config.disable_softskills){
            this._disableSoftSkills.registerSoftskillDisableRoutes()
        }
    }


    postDBLoad(container: DependencyContainer): void
    {
        this._inst.init(container, InitStage.POST_DB_LOAD)
        this.initInstanceManagers()

        const config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        const medsConfig = JehreeUtilities.readJsonFile("../db/meds.json5", true) as JMOMedicalConfig
        const buffsConfig = JehreeUtilities.readJsonFile("../db/stimulator_buffs.json5", true) as JMOBuffsConfig

        this._medEffectsEdits.pushCustomStimulatorBuffs(buffsConfig, config.healthrate_multiplier, this._inst.dbGlobals)
        this._medEffectsEdits.updateDatabaseMeds(config, medsConfig)
    }
}

module.exports = { mod: new Mod() }