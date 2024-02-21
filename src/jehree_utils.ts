/* eslint-disable @typescript-eslint/brace-style */
import { ILocaleBase } from "@spt-aki/models/spt/server/ILocaleBase";
import * as fs from "fs";
import * as path from "path";
import JSON5 from "json5"
import { BotGeneratorHelper } from "@spt-aki/helpers/BotGeneratorHelper";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { DependencyContainer } from "tsyringe";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";

export class JehreeUtilities 
{
    static readJsonFile(rawPath:string, json5?:boolean, useRawPath:boolean = false):any
    {
        let filePath:string
        if (useRawPath){
            filePath = rawPath
        } else {
            filePath = path.resolve(__dirname, rawPath)
        }

        try
        {
            const file = fs.readFileSync(filePath, "utf8")

            if (json5) return JSON5.parse(file)
    
            return JSON.parse(file)
        } 
        catch (err: unknown)
        {
            if (err instanceof Error)
            {
                console.log(err)

                console.log("!!!-----------------------------------------------------------!!!")
                console.log("[JEHREE UTILITIES WARNING]: Tried to read json at invalid path: " + path)
                console.log("!!!-----------------------------------------------------------!!!")
            }
        }
    }

    static localeSetter(key:string, value:string, dbLocales: ILocaleBase):void
    {
        const locales = Object.values(dbLocales.global)

        for (const lang of locales)
        {
            lang[key] = value
        }
    }

    static getIndexOfArrayValue(array:any[], value:any):number
    {
        let calculatedIndex:number

        for (let i = 0; i < array.length; i++)
        {
            if (array[i] === value)
            {
                calculatedIndex = i
                break
            }
        }

        return calculatedIndex
    }


    static buildInventoryItem(
        container:DependencyContainer,
        itemTpl:string,
        slotId:string,
        parentInstanceId:string,
        instanceIdSuffix:string = "_instance_id"
    ): any
    {

        const botGeneratorHelper = container.resolve<BotGeneratorHelper>("BotGeneratorHelper")
        const hashUtil = container.resolve<HashUtil>("HashUtil")
        const dbTables = container.resolve<DatabaseServer>("DatabaseServer").getTables()
        const dbItems = dbTables.templates.items

        return {
            _id: hashUtil.generate() + instanceIdSuffix,
            _tpl: itemTpl,
            parentId: parentInstanceId,
            slotId: slotId,
            ...botGeneratorHelper.generateExtraPropertiesForItem(dbItems[itemTpl])
        }
    }
}