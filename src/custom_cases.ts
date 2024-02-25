/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { Grid, StackSlot } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { InstanceManager } from "./instance_manager";
import { JMOCase, JMOCaseConfig } from "./custom_types/custom_case_types";
import { JehreeUtilities } from "./jehree_utils";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";


export class CustomCases
{
    private _inst:InstanceManager

    init(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    addCustomCasesToItemDatabase(casesConfig:JMOCaseConfig): void
    {
        this._inst.log("Custom Cases loading...", LogTextColor.MAGENTA)

        for (const customCase of casesConfig.custom_cases){
            this.addCaseToItemDatabase(customCase)
            this.addPackagedCaseToItemDatabase(customCase)

            this._inst.log(`${customCase.name} created and added to database!`, LogTextColor.YELLOW, true)
        }

        for (const customCase of casesConfig.custom_cases){
            this.addItemToGridFilters(
                customCase.tpl,
                [
                    BaseClasses.BACKPACK,
                    BaseClasses.VEST,
                    BaseClasses.POCKETS
                ],
                [
                    "544a11ac4bdc2d470e8b456a", //alpha
                    "5857a8b324597729ab0a0e7d", //beta
                    "59db794186f77448bc595262", //epsilon
                    "5857a8bc2459772bad15db29", //gamma
                    "5c093ca986f7740a1867ab12"  //kappa
                ]
            );
        }

        this._inst.log("Custom Cases loaded!", LogTextColor.MAGENTA)
    }


    addPackagedCaseToItemDatabase(customCase:JMOCase): void
    {
        const ammoBoxTpl = "634959225289190e5e773b3b"
        const ammoBoxClone = this._inst.jsonUtil.clone(this._inst.dbItems[ammoBoxTpl])
        const packagedCaseTpl = customCase.tpl + "_packaged"
        const packagedCaseName = customCase.name + " packaged (unpack me)"
        const packagedShortName = customCase.short_name + " pkg"
        const packagedDescription = "Packaged " + customCase.description

        ammoBoxClone._id = packagedCaseTpl
        ammoBoxClone._props.Prefab.path = customCase.prefab_path
        ammoBoxClone._props.Weight = customCase.weight //calculate correct weight later
        ammoBoxClone._props.Width = customCase.width
        ammoBoxClone._props.Height = customCase.height
             
        ammoBoxClone._name = packagedCaseName
        JehreeUtilities.localeSetter(packagedCaseTpl + " Name", packagedCaseName, this._inst.dbLocales)
        ammoBoxClone._props.ShortName = packagedShortName
        JehreeUtilities.localeSetter(packagedCaseTpl + " ShortName", packagedShortName, this._inst.dbLocales)
        ammoBoxClone._props.Description = packagedDescription
        JehreeUtilities.localeSetter(packagedCaseTpl + " Description", packagedDescription, this._inst.dbLocales)
        this._inst.dbItems[packagedCaseTpl] = ammoBoxClone
    }


    createSlot(parentId:string, count:number, tpl:string):StackSlot
    {
        const id = this._inst.hashUtil.generate()
        return {
            _id: id,
            _max_count: count,
            _name: "cartridges_" + id,
            _parent: parentId,
            _props: {
                filters: [
                    {
                        Filter: [
                            tpl
                        ]
                    }
                ]
            },
            upd: {},
            _proto: "5748538b2459770af276a261"
        }
    }


    addCaseToItemDatabase(customCase:JMOCase): void
    {
        const siccTpl = "5d235bb686f77443f4331278"
        const siccClone = this._inst.jsonUtil.clone(this._inst.dbItems[siccTpl])
        
        siccClone._id = customCase.tpl
        siccClone._props.Prefab.path = customCase.prefab_path
        siccClone._props.Weight = customCase.weight
        siccClone._props.Width = customCase.width
        siccClone._props.Height = customCase.height
        

        siccClone._name = customCase.name
        JehreeUtilities.localeSetter(customCase.tpl + " Name", customCase.name, this._inst.dbLocales)
        siccClone._props.ShortName = customCase.short_name
        JehreeUtilities.localeSetter(customCase.tpl + " ShortName", customCase.short_name, this._inst.dbLocales)
        siccClone._props.Description = customCase.description
        JehreeUtilities.localeSetter(customCase.tpl + " Description", customCase.description, this._inst.dbLocales)

        const newGrids:Array<Grid> = []
        for (const cell of customCase.grid_cells){
            for (const cellName of cell.cell_names){

                const grid = this.createGrid(
                    customCase.tpl,
                    cell.cell_size_h,
                    cell.cell_size_v,
                    cellName,
                    cell.included_filter,
                    cell.excluded_filter
                );

                newGrids.push(grid)
            }
        }

        siccClone._props.Grids = newGrids

        this._inst.dbHandbook.Items.push(
            {
                Id: customCase.tpl,
                ParentId: "5b5f6fa186f77409407a7eb7",
                Price: customCase.flea_value
            }
        );
        this._inst.dbItems[customCase.tpl] = siccClone
    }




    private createGrid(
        parentTpl:string,
        cellsH:number,
        cellsV:number,
        gridName:string,
        includeFilter:Array<string>,
        excludedFilter:Array<string> = []
    ): Grid
    {
        const grid:Grid = {
            _id: this._inst.hashUtil.generate(),
            _name: gridName,
            _parent: parentTpl,
            _props: {
                cellsH: cellsH,
                cellsV: cellsV,
                filters: [
                    {
                        ExcludedFilter: excludedFilter,
                        Filter: includeFilter
                    }
                ],
                isSortingTable: false,
                maxCount: 0,
                maxWeight: 0,
                minCount: 0
            },
            _proto: "IDontThinkThisMatters"
        }

        return grid
    }


    addItemToGridFilters(itemToAdd:string, byParentId:Array<string> = [], bySpecificId:Array<string> = [], excludedFilter:boolean = false): void
    {
        for (const itemId in this._inst.dbItems){
            const item = this._inst.dbItems[itemId]
            const parentId = item._parent

            if (!bySpecificId.includes(itemId) && !byParentId.includes(parentId)) continue;

            const itemGrids = item._props.Grids

            for (const grid of itemGrids){
                if (!excludedFilter){
                    grid._props?.filters[0]?.Filter.push(itemToAdd)
                } else {
                    grid._props?.filters[0]?.ExcludedFilter.push(itemToAdd)
                }
            }
        }
    }
}