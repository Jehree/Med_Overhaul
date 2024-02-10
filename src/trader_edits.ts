/* eslint-disable @typescript-eslint/brace-style */
import { Item } from "@spt-aki/models/eft/common/tables/IItem"
import { InstanceManager } from "./instance_manager"
import { JMOUtils } from "./jmo_utils"
import { JehreeUtilities } from "./jehree_utils"






export class TraderEdits
{
    private _inst:InstanceManager

    initInstanceManager(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    addMedkitContentsToTraderAssorts(medkitsConfig:any):void
    {
        for (const traderId in this._inst.dbTraders){
            const assortItems = this._inst.dbTraders[traderId].assort?.items

            for (const i in assortItems){
                const assortItem = assortItems[i]

                const allMedkitTpls:Array<string> = Object.keys(medkitsConfig)

                //skip if this item isn't a medkit
                if (!allMedkitTpls.includes(assortItem._tpl)){continue}

                const medkitTpl:string = assortItem._tpl
                const medkitInstanceId:string = assortItem._id
                const kitConfig = medkitsConfig[medkitTpl]

                //this is not a secure container med, and it is a medkit, so add its contents to the bot
                JMOUtils.addMedkitContentsToInventory(medkitInstanceId, kitConfig, assortItems, this._inst)
            }
        }
    }


    addMedkitContentsToQuests(medkitsConfig:any):void
    {

        //experiment with /client/game/profile/items/moving
        //it happens when quests are completed
        this.recursivelyCheckForItemsArray(this._inst.dbQuests, medkitsConfig)

    }



    recursivelyCheckForItemsArray(target:any, medkitsConfig:any):void
    {
        for (const key in target){

            if (key === "items"){
                this.handleQuestItemsArray(target, medkitsConfig)
            } else {
                if (!(target[key] instanceof Object)) continue
                this.recursivelyCheckForItemsArray(target[key], medkitsConfig)
            }
        }
    }


    handleQuestItemsArray(items:Array<Item>, medkitsConfig:any):void
    {
        for (const i in items){
            
            const allMedkitTpls:Array<string> = Object.keys(medkitsConfig)

            //skip if this item isn't a medkit
            if (!allMedkitTpls.includes(items[i]._tpl)){continue}

            const item = {
                _id: items[i]._id,
                _tpl: items[i]._tpl
            }

            const medkitTpl:string = item._tpl
            const medkitInstanceId:string = item._id
            const kitConfig = items[medkitTpl]

            
            JMOUtils.addMedkitContentsToInventory(medkitInstanceId, kitConfig, items, this._inst)
        }  
    }

}