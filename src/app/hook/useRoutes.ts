import { SIGN_IN_PATH, SIGN_UP_PATH } from '../page/auth';
import { useHistory } from 'react-router-dom';
import { Runnable } from '@cade-tecnologia/essentials';
import { DASHBOARD_PATH } from '../page/home';
import { LANDING_PAGE_PREFIX } from '../page/landing-page';

interface IUseRoutes {
  goToSignUp: Runnable,
  goToSignIn: Runnable,
  goToDashboard: Runnable,
  goToLandingPage: Runnable,
}
export function useRoutes(): IUseRoutes {
  const history = useHistory();

  return {
    goToSignUp: () => history.push(SIGN_UP_PATH),
    goToSignIn: () => history.push(SIGN_IN_PATH),
    goToDashboard: () => history.push(DASHBOARD_PATH),
    goToLandingPage: () => history.push(LANDING_PAGE_PREFIX),
  };
}