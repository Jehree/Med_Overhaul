/* eslint-disable @typescript-eslint/naming-convention */


export type JMOMedicalItemCategory =
    JMOMedKits |
    JMOBleeds |
    JMOSplints |
    JMOSurgeryKits |
    JMODrugs |
    JMOStims;


export type JMOMedicalConfig =
{
    medkits: JMOMedKits
    bleed: JMOBleeds
    splint: JMOSplints
    surgery_kits: JMOSurgeryKits
    drugs: JMODrugs
    stims: JMOStims
}


export type JMOMedKits = 
{
    grizzly: JMOMedicalItem
    afak: JMOMedicalItem
    car_medkit: JMOMedicalItem
    ifak: JMOMedicalItem
    ai_2: JMOMedicalItem
    salewa: JMOMedicalItem
}


export type JMOBleeds = 
{
    aseptic_bandage: JMOMedicalItem
    army_bandage: JMOMedicalItem
    cat_tourniquet: JMOMedicalItem
    esmarch_tourniquet: JMOMedicalItem
    calok_b_hemo: JMOMedicalItem  
}


export type JMOSplints = 
{
    alu_splint: JMOMedicalItem
    immo_splint: JMOMedicalItem
}


export type JMOSurgeryKits = 
{
    cms_surgerykit: JMOMedicalItem
    surv12_surgerykit: JMOMedicalItem
}


export type JMODrugs = 
{
    ibuprofen: JMOMedicalItem
    analgin: JMOMedicalItem
    augmentin: JMOMedicalItem
    golden_star: JMOMedicalItem
    vaseline: JMOMedicalItem
}


export type JMOStims = 
{
    morphine: JMOMedicalItem
    adrenaline_stim: JMOMedicalItem
    mule_stim: JMOMedicalItem
    propital_stim: JMOMedicalItem
    etg_stim: JMOMedicalItem
    /*
    three_b_TG_stim: JMOMedicalItem
    AHF1_M_stim: JMOMedicalItem
    L1_stim: JMOMedicalItem
    meldonin_stim: JMOMedicalItem
    obdolbos_stim: JMOMedicalItem
    obdolbos2_stim: JMOMedicalItem
    P22_stim: JMOMedicalItem
    PNB_stim: JMOMedicalItem
    perfotoran_stim: JMOMedicalItem
    SJ12_TGLabs_stim: JMOMedicalItem
    SJ1_TGLabs_stim: JMOMedicalItem
    SJ6_TGLabs_stim: JMOMedicalItem
    SJ9_TGLabs_stim: JMOMedicalItem
    trimadol_stim: JMOMedicalItem
    zagustin_stim: JMOMedicalItem
    x_TG_12_antidote_stim: JMOMedicalItem
    */
}


export type JMOMedicalItem =
{
    item_id: string
    medUseTime: number
    MaxHpResource: number
    hpResourceRate: number
    StackMaxSize: number
    StimulatorBuffs: string
    JMOJMOEffects_health: JMOJMOEffects
    JMOJMOEffects_damage: JMOJMOEffects
}


export type JMOSurgeryJMOEffect =
{
    delay: number
    duration: number
    fadeOut: number
    healthPenaltyMin: number
    healthPenaltyMax: number
}


export type JMOJMOEffects =
{
    LightBleeding?: JMOEffect
    HeavyBleeding?: JMOEffect
    Fracture?: JMOEffect
    Pain?: JMOEffect
    DestroyedPart?: JMOSurgeryJMOEffect
}


export type JMOEffect =
{
    delay: number
    duration: number
    fadeOut: number
    cost?: number
}
