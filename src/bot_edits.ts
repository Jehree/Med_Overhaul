/* eslint-disable @typescript-eslint/brace-style */
import path from "path";
import { InstanceManager } from "./instance_manager";
import { JehreeUtilities } from "./jehree_utils";
import { JMOUtils } from "./jmo_utils";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";

const botMeds:Array<string> = [
    "590c657e86f77412b013051d", //grizzly
    "5d02797c86f774203f38e30a", //surv12
    "544fb3f34bdc2d03748b456a", //morphine
    "60098ad7c2240c0fe85c570a" //afak
]

const botMedCopyIdSuffix = "_JMO_copy"

export class BotEdits
{
    onBotGenerated(url:string, info:any, sessionId:string, output:string, _inst:InstanceManager): any
    {
        //const medkits = JSON5.parse(_inst.vfs.readFile(path.resolve(__dirname, "../db/medkits.json5")))
        const medkitsConfig = JehreeUtilities.readJsonFile(path.resolve(__dirname, "../db/medkits.json5"), true)

        const jsonOutput = JSON.parse(output)
        const bots = jsonOutput.data
        
        for (const bot of bots){
            const botInventoryItems = bot.Inventory.items

            for (const i in botInventoryItems){
                const item = botInventoryItems[i] as Item

                //change bot secure container meds to the ones we copied that are unchanged
                if (item.slotId === "SecuredContainer" && botMeds.includes(item._tpl)){
                    item._tpl += botMedCopyIdSuffix
                    continue
                }
                
                const allMedkitTpls:Array<string> = Object.keys(medkitsConfig)

                //skip if not a medkit
                if (!allMedkitTpls.includes(item._tpl)){continue}

                const medkit = item
                const medkitTpl:string = medkit._tpl
                const medkitInstanceId:string = medkit._id
                const kitConfig = medkitsConfig[medkitTpl]

                //this is not a secure container med, and it is a medkit, so add its contents to the bot
                JMOUtils.addMedkitContentsToInventory(medkitInstanceId, kitConfig, botInventoryItems, _inst, kitConfig.slot_filled_chance_bot)
            }
        }

        return JSON.stringify(jsonOutput)
    }


    copyBotMedItems(_inst:InstanceManager): void
    {
        for (const medId of botMeds){
            const medItemCopy = _inst.jsonUtil.clone(_inst.dbItems[medId])
            const newMedItemId = medId + botMedCopyIdSuffix
            medItemCopy._id = newMedItemId
            _inst.dbItems[newMedItemId] = medItemCopy
        }
    }
}