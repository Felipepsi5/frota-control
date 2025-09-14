import { InjectionToken } from '@angular/core';
import { ITruckRepository } from '../contracts/i-truck.repository';
import { IFinancialEntryRepository } from '../contracts/i-financial-entry.repository';
import { ISummaryRepository } from '../contracts/i-summary.repository';

export const TRUCK_REPOSITORY = new InjectionToken<ITruckRepository>('TRUCK_REPOSITORY');
export const FINANCIAL_ENTRY_REPOSITORY = new InjectionToken<IFinancialEntryRepository>('FINANCIAL_ENTRY_REPOSITORY');
export const SUMMARY_REPOSITORY = new InjectionToken<ISummaryRepository>('SUMMARY_REPOSITORY');
