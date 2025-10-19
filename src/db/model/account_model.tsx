import { TransactionModel } from "./base_model";


export class AccountModel implements TransactionModel{
    static scope:string = "transaction";
    static collection:string="account";
    static channel:string = "peakmap_account_transaction";
    _id: string;
    createdAt: number;
    updatedAt?: number;  
    deletedAt?: number; 
    createdBy:string;
    updatedBy?:string;
    deletedBy?:string;
    deleted: boolean
    scope:string;
    channel:string;
    collection:string; 
    fullName:string;
    birthDate:string;
    contactNumber:string;
    emailAddress:string;
    username:string;
    password:string; 
    constructor( data:{
        id: string;
        createdBy:string; 
        updatedBy:string;
        deletedBy:string;
        updatedAt:number;
        deletedAt:number;
        deleted:boolean; 
        fullName:string;
        birthDate:string;
        contactNumber:string;
        emailaddress:string;
        username:string;
        password:string;
    }){
        this._id = data.id;
        this.createdAt = Date.now() ;
        this.updatedAt = data.updatedAt; 
        this.deletedAt = data.deletedAt;
        this.deleted = data.deleted; 
        this.fullName = data.fullName;
        this.birthDate = data.birthDate;
        this.contactNumber = data.contactNumber;
        this.emailAddress = data.emailaddress;
        this.username = data.username;
        this.password = data.password; 
        this.updatedBy = data.updatedBy;
        this.createdBy  = data.createdBy;
        this.deletedBy = data.deletedBy;
        this.scope = AccountModel.scope;
        this.channel = AccountModel.channel;
        this.collection = AccountModel.collection;
    }

}