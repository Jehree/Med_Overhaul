/* eslint-disable @typescript-eslint/naming-convention */




export type JMOBarterConfig = JMOBarterTrader[]


export type JMOBarterTrader =
{
    trader: string
    barters: JMOBarter[]
}


export type JMOBarter =
{
    barter_id: string;
    loyalty_level: number;
    item_tpl: string;
    unlimited_stock: boolean;
    stock_amount: number;
    barter_scheme: JMOBarterScheme[];
}


export type JMOBarterScheme =
{
    count: number;
    _tpl: string; 
}