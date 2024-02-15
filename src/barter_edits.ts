/* eslint-disable @typescript-eslint/brace-style */
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";
import { JMOBarterConfig } from "./custom_types/barter_types";
import { InstanceManager } from "./instance_manager";


export class BarterEdits
{
    private _inst:InstanceManager = new InstanceManager


    initInstanceManager(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    addNewBartersToTraderAssorts(barterConfig:JMOBarterConfig): void
    {
        this._inst.log("Adding barters...", LogTextColor.MAGENTA)

        for (const trader of barterConfig){

            let traderId:string
            
            //convert trader name to trader id
            if (this._inst.traderIdsByName[trader.trader]){
                traderId = this._inst.traderIdsByName[trader.trader]
            } else {
                traderId = trader.trader
            }

            const traderAssort = this._inst.dbTraders[traderId]?.assort

            if (!traderAssort){
                this._inst.log(`Trader id not found: ${traderId}`, LogTextColor.RED)
            }

            for (const jmoBarter of trader.barters){

                traderAssort.items.push(
                    {
                        _id: jmoBarter.barter_id,
                        _tpl: jmoBarter.item_tpl,
                        parentId: "hideout",
                        slotId: "hideout",
                        upd: {
                            StackObjectsCount: jmoBarter.stock_amount,
                            UnlimitedCount: jmoBarter.unlimited_stock
                        }
                    }
                );

                traderAssort.loyal_level_items[jmoBarter.barter_id] = jmoBarter.loyalty_level

                //convert currency abbreviations to their tpl
                for (const scheme of jmoBarter.barter_scheme){
                    if (this._inst.currencyIdsByName[scheme._tpl]){
                        scheme._tpl = this._inst.currencyIdsByName[scheme._tpl]
                    }
                }

                traderAssort.barter_scheme[jmoBarter.barter_id] = [jmoBarter.barter_scheme]
            }
        }

        this._inst.log("Barters added!", LogTextColor.MAGENTA)
    }
}