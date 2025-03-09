export interface MajorAccountInfo {
    majorAccounts: MajorAccount[]
    ok: boolean
  }
  
  export interface MajorAccount {
    id: number
    code: string
    name: string
    majorAccount: string
    accountLevel: string
    accountType: string
    uploadAs: string
    subAccount: boolean
    item: string
    isActive: boolean
    items: Item[]
    sumLastDayShould: number
    sumLastDaySeen: number
  }
  
  export interface Item {
    id: number
    numberItem: string
    conceptOfTheTransaction: string
    should: string
    see: string
    isActive: boolean
    item: Item2
    accountCatalog: AccountCatalog
    accountCatalogId: number
    branchId: number
    itemId: number
  }
  
  export interface Item2 {
    id: number
    noPartida: number
    date: string
    concepOfTheItem: string
    totalDebe: string
    totalHaber: string
    difference: string
    isActive: boolean
    correlative: string
    typeOfAccountId: number
    transmitterId: number
  }
  
  export interface AccountCatalog {
    id: number
    code: string
    name: string
    majorAccount: string
    accountLevel: string
    accountType: string
    uploadAs: string
    subAccount: boolean
    item: string
    isActive: boolean
  }
  