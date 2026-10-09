import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
export function Card({className,...props}:ComponentProps<'div'>){return <div className={cn('ui-card',className)} {...props}/>;}
export function CardHeader({className,...props}:ComponentProps<'div'>){return <div className={cn('ui-card-header',className)} {...props}/>;}
export function CardTitle({className,...props}:ComponentProps<'h3'>){return <h3 className={cn('ui-card-title',className)} {...props}/>;}
export function CardDescription({className,...props}:ComponentProps<'p'>){return <p className={cn('ui-card-description',className)} {...props}/>;}
