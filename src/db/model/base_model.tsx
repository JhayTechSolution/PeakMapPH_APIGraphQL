interface TransactionModel{
    _id: string; 
    createdAt: number;
    updatedAt?: number;  
    deletedAt?: number; 
    createdBy:string;
    updatedBy?:string;
    deletedBy?:string;
    deleted: boolean
}

interface ReferrenceModel{
    _id: string; 
    createdAt:number ;
    updatedAt?:number;
    deletedAt?:number;
    deleted:boolean;
}


export type { TransactionModel, ReferrenceModel }