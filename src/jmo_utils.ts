/* eslint-disable @typescript-eslint/brace-style */

import { InstanceManager } from "./instance_manager"
import { JehreeUtilities } from "./jehree_utils"



export class JMOUtils
{
    static addMedkitContentsToInventory(parentInstanceId:string, medkitConfig:any, inventory:any, _inst:InstanceManager, successChancePerItem:number = 100): void
    {
        const standardIssueTplsAndCounts:{[key: string]: number} = this.getMedkitStandardIssueTplsAndCounts(medkitConfig)

        for (const itemTpl in standardIssueTplsAndCounts){
            const diceRoll:number = Math.random() * 100
            if (successChancePerItem < diceRoll){continue} //skip if roll fails

            const slotCount:number = standardIssueTplsAndCounts[itemTpl]

            for (let i = 0; i < slotCount; i++){
                const slotInventoryItem = JehreeUtilities.buildInventoryItem(
                    _inst.container,
                    itemTpl,
                    "mod_mount_" + itemTpl + i,
                    parentInstanceId
                )

                inventory.push(slotInventoryItem)
            }
        }
    }


    static getMedkitStandardIssueTplsAndCounts(medkitConfig:any): {[key: string]: number}
    {
        const standardIssueTplsAndCounts:{[key: string]: number} = {}
        for (const slot in medkitConfig){
            const slotConfig = medkitConfig[slot]

            //skip if this slot doesn't have a standard issue item
            if (!slotConfig.standard_issue_item){continue}

            const slotCount:number = slotConfig.this_slot_count ?? 1

            standardIssueTplsAndCounts[slotConfig.standard_issue_item] = slotCount
        }

        return standardIssueTplsAndCounts
    }
}