"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const instance_manager_1 = require("./instance_manager");
const bot_edits_1 = require("./bot_edits");
const item_db_edits_1 = require("./item_db_edits");
const trader_edits_1 = require("./trader_edits");
const jehree_utils_1 = require("./jehree_utils");
class Mod {
    modName = "Jehree's Med Overhaul";
    _inst = new instance_manager_1.InstanceManager;
    _botEdits = new bot_edits_1.BotEdits;
    _itemDBEdits = new item_db_edits_1.ItemDBEdits;
    _traderEdits = new trader_edits_1.TraderEdits;
    initInstanceManagers(instanceManager) {
        this._itemDBEdits.initInstanceManager(instanceManager);
        this._traderEdits.initInstanceManager(instanceManager);
    }
    preAkiLoad(container) {
        this._inst.init(container, instance_manager_1.InitStage.PRE_AKI_LOAD);
        this.initInstanceManagers(this._inst);
        //make sure to bind the class instance to the callable so 'this' is defined (thanks Drakia!)
        this._inst.registerStaticRoute("/client/game/bot/generate", "On_Bot_Gen_Med_Overhaul", this._inst.getClassBoundCallable(this._botEdits, this._botEdits.onBotGenerated), container, true);
    }
    postDBLoad(container) {
        this._inst.init(container, instance_manager_1.InitStage.POST_DB_LOAD);
        this.initInstanceManagers(this._inst);
        const medkitsConfig = jehree_utils_1.JehreeUtilities.readJsonFile(path_1.default.resolve(__dirname, "../db/medkits.json5"), true);
        this._botEdits.copyBotMedItems(this._inst);
        this._itemDBEdits.changeMedKitsToSlotContainers(medkitsConfig);
        this._traderEdits.addMedkitContentsToTraderAssorts(medkitsConfig);
        this._traderEdits.addMedkitContentsToQuests(medkitsConfig);
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map