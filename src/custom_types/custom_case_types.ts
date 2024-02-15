/* eslint-disable @typescript-eslint/naming-convention */


export type JMOCaseConfig =
{
    custom_cases: JMOCase[]
}

export type JMOCase =
{
    tpl: string
    name: string
    short_name: string
    description: string
    prefab_path: string
    weight: number
    height: number
    width: number
    grid_cells: JMOGridCell[]
    flea_value: number
    standard_issue_items: JMOStandardIssueItem[]
}

export type JMOStandardIssueItem =
{
    tpl: string,
    count: number
}

export type JMOGridCell =
{
    cell_names:string[]
    cell_size_h: number
    cell_size_v: number
    included_filter: string[]
    excluded_filter: any[] 
}