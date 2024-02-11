/* eslint-disable @typescript-eslint/naming-convention */
export type JMOConfig =
{
    healthrate_multiplier: number
    overhaul_medkits: boolean
    overhaul_bleed_correction: boolean
    overhaul_splints: boolean
    overhaul_surgery_kits: boolean
    overhaul_drugs: boolean
    overhaul_stims: boolean
    
    disable_softskills: boolean
    softskills_to_disable: Record<string, number>
}