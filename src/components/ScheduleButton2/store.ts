import { AlertState } from 'components/MintButton/utils';
import { atom } from 'jotai'


export const AlertScheduleAtom = atom<AlertState>({
    open: false,
    message: "",
    severity: undefined,
    
  });