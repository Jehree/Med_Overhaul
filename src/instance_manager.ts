/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
//import * as fs from "fs"
import * as path from "path"
import { ILogger } from "@spt-aki/models/spt/utils/ILogger"
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer"
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables"
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService"
import { DependencyContainer } from "tsyringe"
import { CustomItemService } from "@spt-aki/services/mod/CustomItemService"
import { ImageRouter } from "@spt-aki/routers/ImageRouter"
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader"
import { ConfigServer } from "@spt-aki/servers/ConfigServer"
import { JsonUtil } from "@spt-aki/utils/JsonUtil"
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper"
import { RagfairPriceService } from "@spt-aki/services/RagfairPriceService"
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil"
import { SaveServer } from "@spt-aki/servers/SaveServer"
import { ItemHelper } from "@spt-aki/helpers/ItemHelper"
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem"
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest"
import { ILocaleBase } from "@spt-aki/models/spt/server/ILocaleBase"
import { VFS } from "@spt-aki/utils/VFS"
import {BotGeneratorHelper} from "@spt-aki/helpers/BotGeneratorHelper"
import { HashUtil } from "@spt-aki/utils/HashUtil"
import { ITrader } from "@spt-aki/models/eft/common/tables/ITrader"
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor"
import { IGlobals } from "@spt-aki/models/eft/common/IGlobals"
import { IHandbookBase } from "@spt-aki/models/eft/common/tables/IHandbookBase"

export enum InitStage {
    PRE_AKI_LOAD,
    POST_DB_LOAD,
    ALL
}

export class InstanceManager
{
    public modName: string = "Jehree's Med Overhaul"

    //useful paths
    public modPath: string = path.normalize(path.join(__dirname, ".."))
    public profilePath: string = path.normalize(path.join(__dirname, "..", "..", "..", "profiles"))
    public modsFolderPath: string = path.normalize(path.join(__dirname, "..", ".."))

    public traderIdsByName:TraderIdsByName = {
        mechanic: TraderId.MECHANIC,
        skier: TraderId.SKIER,
        peacekeeper: TraderId.PEACEKEEPER,
        therapist: TraderId.THERAPIST,
        prapor: TraderId.PRAPOR,
        jaeger: TraderId.JAEGER,
        ragman: TraderId.RAGMAN,
        fence: TraderId.FENCE  
    }
    
    public currencyIdsByName:CurrencyIdsByName = {
        rub: CurrencyId.RUB,
        eur: CurrencyId.EUR,
        usd: CurrencyId.USD
    }

    //initialized at preAkiLoad
    public container: DependencyContainer
    public preAkiModLoader: PreAkiModLoader
    public imageRouter: ImageRouter
    public configServer: ConfigServer
    public saveServer: SaveServer
    public itemHelper: ItemHelper
    public logger: ILogger
    public staticRouter: StaticRouterModService
    public vfs: VFS
    public hashUtil: HashUtil

    //initialized at postDBLoad
    public dbTables: IDatabaseTables
    public dbGlobals: IGlobals
    public dbItems: Record<string, ITemplateItem>
    public dbQuests: Record<string, IQuest>
    public dbTraders: Record<string, ITrader>
    public dbLocales: ILocaleBase
    public dbHandbook: IHandbookBase
    public customItem: CustomItemService
    public jsonUtil: JsonUtil
    public profileHelper: ProfileHelper
    public ragfairPriceService: RagfairPriceService
    public importerUtil: ImporterUtil
    public botGeneratorHelper: BotGeneratorHelper


    init(container: DependencyContainer, initStage:InitStage): void
    {
        if (initStage === InitStage.PRE_AKI_LOAD || initStage === InitStage.ALL){
            this.container = container
            this.preAkiModLoader = container.resolve<PreAkiModLoader>("PreAkiModLoader")
            this.imageRouter = container.resolve<ImageRouter>("ImageRouter")
            this.configServer = container.resolve<ConfigServer>("ConfigServer")
            this.saveServer = container.resolve<SaveServer>("SaveServer")
            this.itemHelper = container.resolve<ItemHelper>("ItemHelper")
            this.logger = container.resolve<ILogger>("WinstonLogger")
            this.staticRouter = container.resolve<StaticRouterModService>("StaticRouterModService")
            this.vfs = container.resolve<VFS>("VFS")
            this.hashUtil = container.resolve<HashUtil>("HashUtil")
        }

        if (initStage === InitStage.POST_DB_LOAD || initStage === InitStage.ALL){
            this.dbTables = container.resolve<DatabaseServer>("DatabaseServer").getTables()
            this.dbGlobals = this.dbTables.globals
            this.dbItems = this.dbTables.templates.items
            this.dbQuests = this.dbTables.templates.quests
            this.dbTraders = this.dbTables.traders
            this.dbLocales = this.dbTables.locales
            this.dbHandbook = this.dbTables.templates.handbook
            this.customItem = container.resolve<CustomItemService>("CustomItemService")
            this.jsonUtil = container.resolve<JsonUtil>("JsonUtil")
            this.profileHelper = container.resolve<ProfileHelper>("ProfileHelper")
            this.ragfairPriceService = container.resolve<RagfairPriceService>("RagfairPriceService")
            this.importerUtil = container.resolve<ImporterUtil>("ImporterUtil")
            this.botGeneratorHelper = container.resolve<BotGeneratorHelper>("BotGeneratorHelper")
        }
    }


    registerStaticRoute
    (
        routeURL:string,
        routeName:string,
        callable:CallableFunction,
        boundClass:any = undefined,
        outputModified:boolean = false
    ): void 
    {

        if (boundClass){
            callable = callable.bind(boundClass)
        }

        this.staticRouter.registerStaticRouter(
            routeName,
            [{
                url: routeURL,
                action: (url, info, sessionId, output) => {
                    const _inst = new InstanceManager()
                    _inst.init(this.container, InitStage.ALL)
                    
                    //url:string, info:any, sessionId:string, output:string, _inst:InstanceManager
                    const modifiedOutput = callable(url, info, sessionId, output, _inst)

                    if (outputModified){
                        return modifiedOutput
                    } else {
                        return output
                    }
                }
            }],
            "aki"
        );
    }


    log(logText:string, logColor:LogTextColor = LogTextColor.WHITE, dontLogModName:boolean = false):void
    {
        switch (dontLogModName){

            case true:{
                this.logger.log(logText, logColor)
                break
            }

            case false:{
                this.logger.log(`[${this.modName}]: ${logText}`, logColor)
                break
            }
        }
    }
}

export enum TraderId {
    MECHANIC = "5a7c2eca46aef81a7ca2145d",
    SKIER = "58330581ace78e27b8b10cee",
    PEACEKEEPER = "5935c25fb3acc3127c3d8cd9",
    THERAPIST = "54cb57776803fa99248b456e",
    PRAPOR = "54cb50c76803fa8b248b4571",
    JAEGER = "5c0647fdd443bc2504c2d371",
    RAGMAN = "5ac3b934156ae10c4430e83c",
    FENCE = "579dc571d53a0658a154fbec" 
}

export enum CurrencyId  {
    RUB = "5449016a4bdc2d6f028b456f",
    EUR = "569668774bdc2da2298b4568",
    USD = "5696686a4bdc2da3298b456a"
}

export type TraderIdsByName = {
    mechanic: "5a7c2eca46aef81a7ca2145d",
    skier: "58330581ace78e27b8b10cee",
    peacekeeper: "5935c25fb3acc3127c3d8cd9",
    therapist: "54cb57776803fa99248b456e",
    prapor: "54cb50c76803fa8b248b4571",
    jaeger: "5c0647fdd443bc2504c2d371",
    ragman: "5ac3b934156ae10c4430e83c",
    fence: "579dc571d53a0658a154fbec"       
}

export type CurrencyIdsByName = {
    rub: "5449016a4bdc2d6f028b456f",
    eur: "569668774bdc2da2298b4568",
    usd: "5696686a4bdc2da3298b456a"
}
