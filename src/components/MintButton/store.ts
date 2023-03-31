import { atom } from 'jotai'
import { AlertState } from './utils';


export const AlertAtom = atom<AlertState>({
    open: false,
    message: "",
    severity: undefined,
    
  });
