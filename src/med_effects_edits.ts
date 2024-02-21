/* eslint-disable @typescript-eslint/brace-style */
import { IGlobals } from "@spt-aki/models/eft/common/IGlobals";
import { JMOBuff, JMOBuffsCategory, JMOBuffsConfig } from "./custom_types/stimulator_buffs_types";
import { JMOMedicalConfig, JMOMedicalItem, JMOMedicalItemCategory, JMOMedicalItemLocales } from "./custom_types/medical_item_types";
import { JMOConfig } from "./custom_types/config_types";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { InstanceManager } from "./instance_manager";
import { JehreeUtilities } from "./jehree_utils";





export class MedEffectsEdits
{
    private _inst:InstanceManager

    init(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    updateDatabaseMeds(config:JMOConfig, medsConfig:JMOMedicalConfig): void
    {
        this._inst.log("Med effects changes loading...", LogTextColor.MAGENTA)

        if (config.overhaul_medkits){
            this.updateMedCategory(medsConfig.medkits)
            this._inst.log("Medkit Overhaul enabled!", LogTextColor.YELLOW, true)
        }

        if (config.overhaul_bleed_correction){
            this.updateMedCategory(medsConfig.bleed)
            this._inst.log("Bandage and Tourniquet Overhaul enabled!", LogTextColor.YELLOW, true)
        }

        if (config.overhaul_splints){
            this.updateMedCategory(medsConfig.splint)
            this._inst.log("Splint Overhaul enabled!",  LogTextColor.YELLOW, true)
        }

        if (config.overhaul_surgery_kits){
            this.updateMedCategory(medsConfig.surgery_kits)
            this._inst.log("Surgery Kit Overhaul enabled!",  LogTextColor.YELLOW, true)
        }

        if (config.overhaul_drugs){
            this.updateMedCategory(medsConfig.drugs)
            this._inst.log("Drugs Overhaul enabled!",  LogTextColor.YELLOW, true)
        }

        if (config.overhaul_stims){
            this.updateMedCategory(medsConfig.stims)
            this._inst.log("Stims Overhaul enabled!",  LogTextColor.YELLOW, true)
        }

        this._inst.log("Med effects changes loaded!", LogTextColor.MAGENTA)
    }


    updateMedCategory(jmoMedCategory:JMOMedicalItemCategory): void
    {
        for (const med in jmoMedCategory){

            const medItem = jmoMedCategory[med] as JMOMedicalItem
            const medId = medItem.item_id
            const medItemParamaters = medItem.database_parameters
            const medDbItem = this._inst.dbItems[medId]

            for (const param in medItemParamaters){

                medDbItem._props[param] = medItemParamaters[param]
            }

            if (medItem.locales){
                this.updateMedLocales(medItem.locales, medId)
            }
        }
    }


    updateMedLocales(itemLocales:JMOMedicalItemLocales, itemTpl:string): void
    {
        if (itemLocales.name){
            JehreeUtilities.localeSetter(itemTpl + " Name", itemLocales.name, this._inst.dbLocales)
        }

        if (itemLocales.short_name){
            JehreeUtilities.localeSetter(itemTpl + " ShortName", itemLocales.short_name, this._inst.dbLocales)
        }

        if (itemLocales.description){
            JehreeUtilities.localeSetter(itemTpl + " Description", itemLocales.description, this._inst.dbLocales)
        }
    }


    pushCustomStimulatorBuffs(buffsConfig:JMOBuffsConfig, healthrateMultiplier:number, dbGlobals:IGlobals): void
    {

        const newBuffs:Array<JMOBuffsCategory> = [
            buffsConfig.medkits,
            buffsConfig.drugs,
            buffsConfig.injury_correction,
            buffsConfig.stims
        ]

        for (const buffCategory of newBuffs){

            for (const stimulatorBuffKey in buffCategory){

                const stimulatorBuffEffects = buffCategory[stimulatorBuffKey] as JMOBuff[]

                
                for (const buff of stimulatorBuffEffects){

                    if (buff.BuffType === "HealthRate"){
                        buff.Value *= healthrateMultiplier
                    }
                }

                dbGlobals.config.Health.Effects.Stimulator.Buffs[stimulatorBuffKey] = stimulatorBuffEffects
            }
        }
    }

}