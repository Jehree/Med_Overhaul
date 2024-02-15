/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor"
import { JMOConfig } from "./custom_types/config_types"
import { InstanceManager } from "./instance_manager"
import { JehreeUtilities } from "./jehree_utils"





export class DisableSoftskills
{
    private _inst:InstanceManager

    init(instanceManager:InstanceManager): void
    {
        this._inst = instanceManager
    }


    registerSoftskillDisableRoutes(): void
    {
        const routesToCallDisableSoftskills = [
            "/client/raid/configuration",
            "/client/match/offline/end"
        ]

        for (const url of routesToCallDisableSoftskills){
            this._inst.registerStaticRoute(
                url,
                url + "_JMO",
                this.disableSoftskills,
                this
            )
        }
    }


    private disableSoftskills(url:string, info:any, sessionId:string, output:string, _inst:InstanceManager):void
    {
        const config = JehreeUtilities.readJsonFile("../config/config.json5", true) as JMOConfig
        const profile = _inst.saveServer.getProfile(sessionId)
        const profileSkills = profile.characters.pmc?.Skills?.Common

        if (!profileSkills) return;
        if (!config.disable_softskills) return;

        const softSkillsToDisable = config.softskills_to_disable

        _inst.log("These skills have been set to level...", LogTextColor.MAGENTA)
        for (const skill of profileSkills){

            if (!Object.keys(softSkillsToDisable).includes(skill.Id)) continue;

            skill.Progress = softSkillsToDisable[skill.Id]

            _inst.log(`${skill.Id}: ${softSkillsToDisable[skill.Id]}`, LogTextColor.MAGENTA, true)
        }
    }
}