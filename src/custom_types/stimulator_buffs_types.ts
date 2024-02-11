/* eslint-disable @typescript-eslint/naming-convention */

export type JMOBuffsCategory =
    JMOMedkitsBuffs |
    JMOInjuryCorrectionBuffs |
    JMODrugsBuffs |
    JMOStimulatorsBuffs;


export type JMOBuffsConfig =
{
    medkits: JMOMedkitsBuffs
    injury_correction: JMOInjuryCorrectionBuffs
    drugs: JMODrugsBuffs
    stims: JMOStimulatorsBuffs
}


export type JMOMedkitsBuffs =
{
    buffs_ai_2_jmo: JMOBuff[]
    buffs_car_jmo: JMOBuff[]
    buffs_salewa_jmo: JMOBuff[]
    buffs_ifak_jmo: JMOBuff[]
    buffs_afak_jmo: JMOBuff[]
    buffs_grizzly_jmo: JMOBuff[]
}


export type JMOInjuryCorrectionBuffs =
{
    buffs_calok_b_hemo_jmo: JMOBuff[]
    buffs_splint_tourniquet_jmo: JMOBuff[]
    buffs_surgery_jmo: JMOBuff[]
}


export type JMODrugsBuffs =
{
    buffs_ibuprofen_jmo: JMOBuff[]
    buffs_analgin_jmo: JMOBuff[]
    buffs_augmentin_jmo: JMOBuff[]
    buffs_golden_star_jmo: JMOBuff[]
    buffs_vaseline_jmo: JMOBuff[]
}


export type JMOStimulatorsBuffs =
{
    buffs_morphine_jmo: JMOBuff[]
    buffs_adrenaline_jmo: JMOBuff[]
    buffs_mule_jmo: JMOBuff[]
    buffs_propital_jmo: JMOBuff[]
    buffs_etg_jmo: JMOBuff[]
}


export type JMOBuff =
{
    BuffType: string
    Chance: number
    Delay: number
    Duration: number
    Value: number
    AbsoluteValue: boolean
    SkillName: string
    AppliesTo?: any[]
}


