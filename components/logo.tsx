import { cn } from '@/lib/utils';
export function Logo({mark=false,className}:{mark?:boolean;className?:string}){
 return <span className={cn(mark?'tess-logo tess-logo-mark':'tess-logo',className)} aria-hidden="true"/>;
}
