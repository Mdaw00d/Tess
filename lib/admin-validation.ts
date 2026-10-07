import { z } from 'zod';
import { definitionSchema } from './content';

const line=z.string().trim().min(1).max(2000);
export const editableDefinitionSchema=definitionSchema.omit({evaluationCount:true}).extend({
  slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase letters, numbers, and hyphens.').max(100),
  name:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(1000),category:z.string().trim().min(1).max(80),
  inputs:z.array(line).min(1).max(40),outputs:z.array(line).min(1).max(40),stages:z.array(line).min(1).max(40),
  limitations:z.string().trim().min(1).max(10000),related:z.string().regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  version:z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,'Use a version such as 0.1.0.').max(40),
  instructions:z.string().max(100000).optional(),examples:z.string().max(20000).optional(),tools:z.string().max(5000).optional(),conditions:z.string().max(5000).optional(),termination:z.string().max(5000).optional(),
});
export type EditableDefinition=z.infer<typeof editableDefinitionSchema>;
export const emptyDefinition:EditableDefinition={slug:'',name:'',description:'',category:'',kind:'skill',version:'0.1.0',inputs:[],outputs:[],stages:[],limitations:'',related:'',instructions:'',examples:'',tools:'',conditions:'',termination:''};
export function nextVersion(version:string){const parts=version.split('.').map(Number);return parts.length===3&&parts.every(Number.isSafeInteger)?`${parts[0]}.${parts[1]}.${parts[2]+1}`:'0.1.0';}
export function isAdminIdentity(user:{email:string;emailVerified:boolean}|null,allowed:string|undefined){
  return Boolean(user?.emailVerified&&allowed?.split(',').map(value=>value.trim().toLowerCase()).filter(Boolean).includes(user.email.toLowerCase()));
}
export function parseUpload(text:string,filename:string,current:EditableDefinition){
  if(new TextEncoder().encode(text).length>200000)throw new Error('Files must be smaller than 200 KB.');
  if(filename.toLowerCase().endsWith('.json'))return editableDefinitionSchema.parse(JSON.parse(text));
  if(/\.(md|txt)$/i.test(filename))return {...current,instructions:text};
  throw new Error('Upload a JSON definition, Markdown file, or text file.');
}
