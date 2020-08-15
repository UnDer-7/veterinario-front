import React, { ReactElement, useEffect, useState } from 'react';

import { Button, Grid, Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Form } from 'react-final-form'
import { get as _get, set as _set } from 'lodash';
import {  ValidationError as YupValidationError } from 'yup';
import { finalize } from 'rxjs/operators';

import { SignUpContextProvider, useSignUpContext } from './context';
import StepperSignUp from './stepper/StepperSignUp';
import { WithMargin } from '../../../component';
import ChaveAcessoDialog from './chave-acesso/ChaveAcesso';
import { ICadastro, DadosUsuarioValidationSchema, DadosEmpresariaisValidationSchema, DadosPessoaisValidationSchema } from './validation-schema';
import { TypeSafeGuard } from '../../../util';
import { CadastroService, ChaveService } from '../../../service';
import { Steps } from './steps';

function convertYupErrorsToFieldErrors(yupErrors: YupValidationError) {
  return yupErrors.inner.reduce((errors, { path, message }) => {
    if (_get(errors, path)) {
      _set(errors, path, _get(errors, path));
    } else {
      _set(errors, path, message);
    }
    return errors;
  }, {});
}

function SignUp(): ReactElement {
  const {
    stepperStore: {
      currentStep,
      proximoStep,
      voltarStep,
      estaNoPrimeiroSteep
    },
    formularioCadastro,
    blockUIStore: { toggle: toggleBlockUI }
  } = useSignUpContext();

  const [formErros, _setFormErros] = useState({
    isDadosPessoaisValid: false,
    isDadosEmpresariaisValid: false,
    isDadosUsuariosValid: false,
  });

  useEffect(() => {
    if (formularioCadastro.setField) {
      formularioCadastro.setField()('tipoPessoa', 'RESPONSAVEL');
      formularioCadastro.setField()('usuario.perfil', 'ADMINISTRADOR');
    }
  }, [formularioCadastro.setField]);

  function setFormErros(formName: 'isDadosPessoaisValid' | 'isDadosEmpresariaisValid' | 'isDadosUsuariosValid', value: boolean = true): void {
    if (formErros[formName] === value) return; // somente atualizar se necessario

    _setFormErros(prevState => ({
      ...prevState,
      [formName]: value,
    }));
  }

  async function validateForm(values: any) {
    async function validarDadosPessoais(): Promise<void> {
      await DadosPessoaisValidationSchema.validate(values, { abortEarly: false })
        .catch((err) => {
          setFormErros('isDadosPessoaisValid', false)
          return Promise.reject(err)
        })
      setFormErros('isDadosPessoaisValid');
    }

    async function validarDadosEmpresariais(): Promise<void> {
      await DadosEmpresariaisValidationSchema.validate(values, { abortEarly: false })
        .catch((err) => {
          setFormErros('isDadosEmpresariaisValid', false)
          return Promise.reject(err);
        })
      setFormErros('isDadosEmpresariaisValid');
    }

    async function validarDadosUsuario(): Promise<void> {
      await DadosUsuarioValidationSchema.validate(values, { abortEarly: false })
        .catch((err) => {
          setFormErros('isDadosUsuariosValid', false);
          return Promise.reject(err);
        });
      setFormErros('isDadosUsuariosValid');
    }

    try {
      await validarDadosPessoais();
      await validarDadosEmpresariais();
      await validarDadosUsuario();
    } catch (err) {
      if (TypeSafeGuard().isValidationError((err))) {
        return convertYupErrorsToFieldErrors(err);
      }

      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('Err is not an ValidationError from Yup');
    }
  }

  function onSubmit(payload: ICadastro): void {
    CadastroService.cadastrarResponsavel(payload)
      .subscribe(
        (res) => {
          console.log('RES: ', res);
        },
        (err) => {
          console.log('Err: ', err);
        }
      )
  }

  function aoValidarChave(chave: string): void {
    if (formularioCadastro.setField) {
      formularioCadastro.setField()('empresa.chave.chave', chave)
    }
  }

  function isProximoButaoDisabled(): boolean {
    const {
      isDadosEmpresariaisValid,
      isDadosPessoaisValid,
      isDadosUsuariosValid
    } = formErros;

    if (currentStep === 0 && !isDadosPessoaisValid) return true;
    if (currentStep === 1 && !isDadosEmpresariaisValid) return true;
    return currentStep === 2 && !isDadosUsuariosValid;
  }

  function onProximo(): void {
    if (estaNoPrimeiroSteep) {
      toggleBlockUI();
      ChaveService.gerarChave(formularioCadastro!.field!.empresa!.chave!.tipo)
        .pipe(
          finalize(() => {
            toggleBlockUI();
            proximoStep();
          })
        )
        .subscribe(
          (res) => console.log('Chave Gerada: ', res),
          (err) => console.log('HANDLE', err)
        );
      return;
    }
    proximoStep();
  }

  const canSubmit = !(
    formErros.isDadosPessoaisValid &&
    formErros.isDadosEmpresariaisValid &&
    formErros.isDadosUsuariosValid);

  const salvarToolTip = canSubmit
    ? 'Preencha todo formulario antes'
    : '';

  const proximoToolTip = isProximoButaoDisabled()
    ? 'Preencha o formulario atual antes'
    : '';

  return (
    <>
      <SignUpContextProvider>
        <Grid container item>
          <ChaveAcessoDialog onSuccess={ aoValidarChave }/>
          <Grid container item xs={12} sm={3}>
            <StepperSignUp />
          </Grid>
          <Grid container item xs={12} sm={9}>
            <WithMargin margin='10px'>
              <Form onSubmit={ onSubmit }
                    validate={ (validateForm) }
                    mutators={{
                      setField: (_, state, {changeValue}) =>
                        (fieldName: string, fieldValue: string) =>
                          changeValue(state, fieldName, () => fieldValue),
                    }}
                    render={ ({ handleSubmit, form, values }) => {
                      formularioCadastro.setField = form.mutators.setField
                      formularioCadastro.field = values;
                      return (
                        <form noValidate onSubmit={ handleSubmit }>
                          <Steps />
                          <Grid item container direction='row' justify='center' xs={ 8 } spacing={ 2 }>
                            <Grid item md={ 4 }>
                              <Tooltip title={salvarToolTip}>
                                <span>
                                  <Button fullWidth
                                          type='submit'
                                          variant='contained'
                                          color='primary'
                                          disabled={ canSubmit }
                                  >
                                    Salvar
                                  </Button>
                                </span>
                              </Tooltip>
                            </Grid>
                            { currentStep < 5 && (
                              <Grid item md={ 4 }>
                                <Tooltip title={proximoToolTip}>
                                  <span>
                                    <Button fullWidth
                                            variant='outlined'
                                            color='primary'
                                      // disabled={ isProximoButaoDisabled() }
                                            onClick={ onProximo }
                                    >
                                      Proximo
                                    </Button>
                                  </span>
                                </Tooltip>
                              </Grid>
                            ) }
                            { currentStep > 0 && (
                              <Grid item md={ 4 }>
                                <Button fullWidth
                                        variant='outlined'
                                        color='primary'
                                        onClick={ voltarStep }
                                >
                                  Voltar
                                </Button>
                              </Grid>
                            ) }
                          </Grid>
                        </form>
                      )
                    } }
              />
            </WithMargin>
          </Grid>
        </Grid>
      </SignUpContextProvider>
    </>
  )
}

export default observer(SignUp);
