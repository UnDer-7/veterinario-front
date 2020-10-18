import { AbstractEnvironmentVariables } from '@vetnow-management/essentials';

class Environment extends AbstractEnvironmentVariables {
  public readonly NODE_ENV: string = this.getVariable('NODE_ENV', false);

  public readonly APP_NAME: string = 'Veterinario';

  public readonly API_URL: string = this.getVariable('API_URL');

  public readonly KEYCLOAK_URL: string = this.getVariable('KEYCLOAK_URL');

  public readonly VIA_CEP_URL: string = this.getVariable('VIA_CEP_URL');

  public readonly GIT_HUB_URL: string = this.getVariable('GIT_HUB_URL');

  public readonly PRIMARY_COLOR: string = '#0984E3';

  public readonly SECONDARY_COLOR: string = '#E17055';

  public readonly ERROR_COLOR: string = '#ff1744';

  public constructor() {
    super('REACT_APP');
  }
}

export default new Environment();
