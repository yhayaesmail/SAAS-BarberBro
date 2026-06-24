import { useState, useCallback } from 'react';

export function useFormField(initialValue = '', validators = []) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  const validate = useCallback((val) => {
    for (const fn of validators) {
      const err = fn(val);
      if (err) { setError(err); return err; }
    }
    setError(null);
    return null;
  }, [validators]);

  const onChange = useCallback((e) => {
    const val = e.target ? e.target.value : e;
    setValue(val);
    if (touched) validate(val);
  }, [touched, validate]);

  const onBlur = useCallback(() => {
    setTouched(true);
    validate(value);
  }, [value, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setTouched(false);
    setError(null);
  }, [initialValue]);

  return { value, error, touched, onChange, onBlur, setValue: onChange, reset, validate: () => validate(value) };
}

export const required = (msg = 'This field is required') => (v) => (!v || (typeof v === 'string' && !v.trim())) ? msg : null;
export const minLength = (min, msg) => (v) => v && v.length < min ? (msg || `Minimum ${min} characters`) : null;
export const isEmail = (msg = 'Invalid email format') => (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : null;
export const isPhone = (msg = 'Invalid phone number') => (v) => v && !/^(?:\+20|0020|0)?1[0-2,5]{1}[0-9]{8}$/.test(v.replace(/\s+/g, '')) ? msg : null;
export const matchField = (matchValue, msg) => (v) => v !== matchValue ? (msg || 'Values do not match') : null;
