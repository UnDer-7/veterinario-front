import React, { ReactElement } from 'react';

import { Grid } from '@material-ui/core';
import { TextField } from 'mui-rff';
import { observer } from 'mobx-react';

function FormUsuario(): ReactElement {
  return (
    <Grid item container direction='row' alignItems='center' justify='center' spacing={ 2 }>
      <Grid item xs={ 12 }>
        <TextField fullWidth
                   required
                   name='usuario.usuario'
                   label='Usuário'
        />
      </Grid>
      <Grid item xs={ 12 }>
        <TextField fullWidth
                   required
                   type='password'
                   name='usuario.senha'
                   label='Senha'
        />
      </Grid>
    </Grid>
  );
}

export default observer(FormUsuario);
