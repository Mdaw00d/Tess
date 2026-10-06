'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { createPassword } from '@/app/account/actions';
import { newPasswordSchema } from '@/lib/password-validation';

export function PasswordSettings({hasPassword}:{hasPassword:boolean}) {
  const [created,setCreated]=useState(hasPassword);const [pending,setPending]=useState(false);const [message,setMessage]=useState('');
  return <section className="password-settings"><h2>{created?'Change password':'Create a TESS password'}</h2><p>{created?'Choose a new password for email sign-in.':'Create a separate TESS password to sign in with your email. Your Google password stays with Google.'}</p>
    <form key={String(created)} onSubmit={async event=>{
      event.preventDefault();setMessage('');const element=event.currentTarget;const form=new FormData(element);
      const input={password:String(form.get('password')??''),confirmPassword:String(form.get('confirmPassword')??'')};
      const valid=newPasswordSchema.safeParse(input);if(!valid.success){setMessage(valid.error.issues[0].message);return;}
      setPending(true);
      try {
        if(created){const result=await authClient.changePassword({newPassword:input.password,currentPassword:String(form.get('currentPassword')??''),revokeOtherSessions:true});if(result.error){setMessage('Unable to change your password. Check your current password and sign in again if needed.');return;}}
        else {const result=await createPassword(input);if(result.error){setMessage(result.error);return;}setCreated(true);}
        element.reset();setMessage(created?'Password changed. Other sessions were signed out.':'TESS password created. You can now sign in with your email.');
      }catch{setMessage('Unable to save your password. Please try again.');}finally{setPending(false);}
    }}><fieldset disabled={pending}>
      {created&&<label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required maxLength={128}/></label>}
      <label>New password<input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
      <p className="password-hint">Use 12–128 characters.</p>
      <label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" maxLength={128} required/></label>
      <button className="button secondary" type="submit">{pending?'Saving…':created?'Change password':'Create password'}</button>
    </fieldset></form><p role="status" aria-live="polite">{message}</p>
  </section>;
}
