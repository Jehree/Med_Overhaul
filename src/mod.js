"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instance_manager_1 = require("./instance_manager");
const jehree_utils_1 = require("./jehree_utils");
const med_effects_edits_1 = require("./med_effects_edits");
const disable_softskills_1 = require("./disable_softskills");
class Mod {
    _inst = new instance_manager_1.InstanceManager;
    _medEffectsEdits = new med_effects_edits_1.MedEffectsEdits;
    _disableSoftSkills = new disable_softskills_1.DisableSoftskills;
    initInstanceManagers() {
        this._medEffectsEdits.initInstanceManager(this._inst);
        this._disableSoftSkills.initInstanceManager(this._inst);
    }
    preAkiLoad(container) {
        this._inst.init(container, instance_manager_1.InitStage.PRE_AKI_LOAD);
        this.initInstanceManagers();
        const config = jehree_utils_1.JehreeUtilities.readJsonFile("../config/config.json5", true);
        if (config.disable_softskills) {
            this._disableSoftSkills.registerSoftskillDisableRoutes();
        }
    }
    postDBLoad(container) {
        this._inst.init(container, instance_manager_1.InitStage.POST_DB_LOAD);
        this.initInstanceManagers();
        const config = jehree_utils_1.JehreeUtilities.readJsonFile("../config/config.json5", true);
        const medsConfig = jehree_utils_1.JehreeUtilities.readJsonFile("../db/meds.json5", true);
        const buffsConfig = jehree_utils_1.JehreeUtilities.readJsonFile("../db/stimulator_buffs.json5", true);
        this._medEffectsEdits.pushCustomStimulatorBuffs(buffsConfig, config.healthrate_multiplier, this._inst.dbGlobals);
        this._medEffectsEdits.updateDatabaseMeds(config, medsConfig);
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map