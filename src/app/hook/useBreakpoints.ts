import { useState } from 'react';

import { useMediaQuery, useTheme } from '@material-ui/core';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';
import { BiFunc, Func } from '@vetnow-management/essentials';

type DefaultParam = Breakpoint | number;

interface IUseBreakpoints {
  up: Func<DefaultParam, boolean>,
  down: Func<DefaultParam, boolean>,
  between: BiFunc<DefaultParam, DefaultParam, boolean>,
  only: Func<Breakpoint, boolean>,
}

// todo: mover para o @vetnow-management/react-library
export default function useBreakpoints(listenWindowResize: boolean = false): IUseBreakpoints {
  const theme = useTheme();
  const [, setSize ] = useState<number>(0);

  // fixme: Mudar para useEffect
  if (listenWindowResize) {
    window.addEventListener('resize', () => {
      setSize(window.innerHeight);
    });
  }

  function useUp(key: DefaultParam): boolean {
    return useMediaQuery(theme.breakpoints.up(key));
  }

  function useDown(key: DefaultParam): boolean {
    return useMediaQuery(theme.breakpoints.down(key));
  }

  function useBetween(start: DefaultParam, end: DefaultParam): boolean {
   return useMediaQuery(theme.breakpoints.between(start, end));
  }

  function useOnly(key: Breakpoint): boolean {
    return useMediaQuery(theme.breakpoints.only(key));
  }

  return {
    up: useUp,
    down: useDown,
    between: useBetween,
    only: useOnly,
  };
}
