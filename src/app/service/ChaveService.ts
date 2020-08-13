import { AbstractService } from './index';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

class ChaveService extends AbstractService {
  public constructor() {
    super('chave');
  }

  public gerarChave(chave: string): Observable<string> {
    return of<string>('1111222333444')
      .pipe(delay(3000))
  }
}

export default new ChaveService();