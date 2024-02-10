/* eslint-disable @typescript-eslint/brace-style */
import { DependencyContainer } from "tsyringe";
import path from "path";
import { InitStage, InstanceManager } from "./instance_manager";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { BotEdits } from "./bot_edits";
import { ItemDBEdits } from "./item_db_edits";
import { TraderEdits } from "./trader_edits";
import { JehreeUtilities } from "./jehree_utils";


//rebalance meds
    //medkits become multi use heal-over-time stims only, and get bundle swaps
    
//create medkit cases

//add cases to traders
    //make barters to fill cases
    //make full case purchases

//make cases able to spawn full of meds:
    //on bots
    //in world

    
class Mod implements IPostDBLoadMod, IPreAkiLoadMod
{   
    private modName:string = "Jehree's Med Overhaul"
    private _inst:InstanceManager = new InstanceManager
    private _botEdits:BotEdits = new BotEdits
    private _itemDBEdits:ItemDBEdits = new ItemDBEdits
    private _traderEdits:TraderEdits = new TraderEdits

    initInstanceManagers(instanceManager:InstanceManager)
    {
        this._itemDBEdits.initInstanceManager(instanceManager)
        this._traderEdits.initInstanceManager(instanceManager)
    }

    preAkiLoad(container: DependencyContainer): void {

        this._inst.init(container, InitStage.PRE_AKI_LOAD)
        this.initInstanceManagers(this._inst)

        //make sure to bind the class instance to the callable so 'this' is defined (thanks Drakia!)
        this._inst.registerStaticRoute(
            "/client/game/bot/generate",
            "On_Bot_Gen_Med_Overhaul",
            this._inst.getClassBoundCallable(this._botEdits, this._botEdits.onBotGenerated),
            container,
            true
        )
    }


    postDBLoad(container: DependencyContainer): void {

        this._inst.init(container, InitStage.POST_DB_LOAD)
        this.initInstanceManagers(this._inst)
        const medkitsConfig = JehreeUtilities.readJsonFile(path.resolve(__dirname, "../db/medkits.json5"), true)

        this._botEdits.copyBotMedItems(this._inst)
        this._itemDBEdits.changeMedKitsToSlotContainers(medkitsConfig)
        this._traderEdits.addMedkitContentsToTraderAssorts(medkitsConfig)
        this._traderEdits.addMedkitContentsToQuests(medkitsConfig)
    }


    

}

module.exports = { mod: new Mod() }