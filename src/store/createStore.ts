import { useEffect, useState, useSyncExternalStore } from 'react';

type SetterFn<T> = (prevState: T) => Partial<T>;
type SetStateFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;

// uso de T em TState é pra ficar claro que é um generic type
export function createStore<TState extends Record<string, any>>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;
  let listeners: Set<() => void>;

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue = typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue,
    };

    notifyListeners();
  }

  function subscribe (listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    }
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(selector: (currenState: TState) => TValue): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore;
}

// function useStore<TValue>(selector: (currenState: TState) => TValue): TValue {
//   const [value, setValue] = useState(() => selector(state));

//   useEffect(() => {
//     // inscricao do listener
//     const unsubscribe = subscribe(() => {
//       const newValue = selector(state);
      
//       if (value !== newValue) {
//         setValue(newValue);
//       }
//     });

//     // remocao da inscricao do listener por boas praticas
//     return () => {
//       unsubscribe();
//     };
//   }, [selector, value]);

//   return value;
// }