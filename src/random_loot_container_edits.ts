/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IItemEventRouterResponse } from "@spt-aki/models/eft/itemEvent/IItemEventRouterResponse";
import { IOpenRandomLootContainerRequestData } from "@spt-aki/models/eft/inventory/IOpenRandomLootContainerRequestData";
import { AddItem, IAddItemRequestData } from "@spt-aki/models/eft/inventory/IAddItemRequestData";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { InventoryHelper } from "@spt-aki/helpers/InventoryHelper";
import { LootGenerator } from "@spt-aki/generators/LootGenerator";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { DependencyContainer } from "tsyringe";
import { InventoryCallbacks } from "@spt-aki/callbacks/InventoryCallbacks";
import { JMOCase, JMOCaseConfig } from "./custom_types/custom_case_types";
import { JehreeUtilities } from "./jehree_utils";
import { InstanceManager } from "./instance_manager";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";



export class RandomLootContainerEdits
{
    private _inst:InstanceManager
    private itemHelper:ItemHelper
    private inventoryHelper:InventoryHelper
    private lootGenerator:LootGenerator
    private eventOutputHolder:EventOutputHolder
    private casesConfig:JMOCaseConfig

    init():void
    {
        this.itemHelper = this._inst.itemHelper
        this.inventoryHelper = this._inst.inventoryHelper
        this.lootGenerator = this._inst.lootGenerator
        this.eventOutputHolder = this._inst.eventOutputHolder
        this.casesConfig = JehreeUtilities.readJsonFile("../db/cases.json5", true) as JMOCaseConfig
    }


    initInstanceManager(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    replaceOpenRandomLootContainerMethod(container:DependencyContainer):void
    {
        this.init()

        container.afterResolution("InventoryCallbacks", (_t, result: InventoryCallbacks) =>
        {
            result.openRandomLootContainer = (
                pmcData: IPmcData,
                body: IOpenRandomLootContainerRequestData,
                sessionID: string
            ) => 
            {
                return this.openRandomLootContainerReplacement(pmcData, body, sessionID)
            }

        }, {frequency: "Always"});

        this._inst.log("openRandomLootContainer Method override complete", LogTextColor.YELLOW, true)
    }


    openRandomLootContainerReplacement(
        pmcData: IPmcData,
        body: IOpenRandomLootContainerRequestData,
        sessionID: string
    ): IItemEventRouterResponse
    {
        const openedItem = pmcData.Inventory.items.find((x) => x._id === body.item);
        const containerDetails = this.itemHelper.getItem(openedItem._tpl);
        const isSealedWeaponBox = containerDetails[1]._name.includes("event_container_airdrop");

        const newItemRequest: IAddItemRequestData = { tid: "RandomLootContainer", items: [] };

        const jmoCase = this.getJMOCase(openedItem._tpl)

        let foundInRaid = false;
        if (isSealedWeaponBox)
        {
            const containerSettings = this.inventoryHelper.getInventoryConfig().sealedAirdropContainer;
            newItemRequest.items.push(...this.lootGenerator.getSealedWeaponCaseLoot(containerSettings));

            foundInRaid = containerSettings.foundInRaid;
        }
        else if (jmoCase)
        {
            const caseItems:AddItem[] = this.getCaseItems(jmoCase)
            newItemRequest.items.push(...caseItems)
            foundInRaid = false
            this._inst.log("Medkit Case unpacked!: " + jmoCase.name, LogTextColor.MAGENTA)
        }
        else
        {
            // Get summary of loot from config
            const rewardContainerDetails = this.inventoryHelper.getRandomLootContainerRewardDetails(openedItem._tpl);
            newItemRequest.items.push(...this.lootGenerator.getRandomLootContainerLoot(rewardContainerDetails));

            foundInRaid = rewardContainerDetails.foundInRaid;
        }

        const output = this.eventOutputHolder.getOutput(sessionID);

        // Find and delete opened item from player inventory
        this.inventoryHelper.removeItem(pmcData, body.item, sessionID, output);

        // Add reward items to player inventory
        this.inventoryHelper.addItem(pmcData, newItemRequest, output, sessionID, null, foundInRaid, null, true);

        
        return output;
    }


    getJMOCase(tpl:string): JMOCase
    {
        for (const customCase of this.casesConfig.custom_cases){
            if (customCase.tpl + "_packaged" === tpl){
                return customCase
            }
        }

        return
    }


    getCaseItems(customCase:JMOCase): AddItem[]
    {
        const caseItems:AddItem[] = [
            {
                item_id: customCase.tpl,
                count: 1 
            }
        ]

        for (const item of customCase.standard_issue_items){

            const addItem:AddItem =
            {
                count: item.count,
                item_id: item.tpl
            }

            caseItems.push(addItem);
        }

        return caseItems
    }
}