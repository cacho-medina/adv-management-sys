import { SetMetadata } from '@nestjs/common';

export const BUSINESS_ACCESS_KEY = 'businessAccess';
export const BusinessAccess = () => SetMetadata(BUSINESS_ACCESS_KEY, true);
