/* eslint-disable @typescript-eslint/brace-style */
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem"
import { InstanceManager } from "./instance_manager"





export class ItemDBEdits
{
    private _inst:InstanceManager

    initInstanceManager(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }

    changeMedKitsToSlotContainers(medkitsConfig:any): void
    {
        for (const kitId in medkitsConfig){
            
            const kitConfig = medkitsConfig[kitId]
            
            const dbMedkit:ITemplateItem = this._inst.dbItems[kitId]
            dbMedkit._parent = "55818b224bdc2dde698b456f" //"Mount" id
            dbMedkit._props["Slots"] = []
            const medkitSlots = dbMedkit._props.Slots


            for (const slot in kitConfig){
                const slotConfig = kitConfig[slot]
                const slotCount:number = slotConfig.this_slot_count ?? 1

                for (let i = 0; i < slotCount; i++){
                    const allItemsAllowedInSlot:Array<string> = [slotConfig.standard_issue_item, ...slotConfig.additional_accepted_items]

                    const slotName = "mod_mount_" + slotConfig.standard_issue_item + i
                    const slotId = slotConfig.standard_issue_item + "_slot_id" + i
                    medkitSlots.push(this.createSlotElement(slotName, slotId, kitId, allItemsAllowedInSlot))
                }
            }
        }
    }

    createSlotElement(slotName:string, slotId:string, itemId:string, allowedItems:Array<string>): any
    {
        return {
            "_name": slotName,
            "_id": slotId,
            "_parent": itemId,
            "_props": {
                "filters": [
                    {
                        "Filter": allowedItems,
                        "ExcludedFilter": [""]
                    }
                ],
                "_required": false,
                "_mergeSlotWithChildren": false
            }
        }
    }
}