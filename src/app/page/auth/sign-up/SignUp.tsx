import React, { ReactElement, useEffect, useState } from 'react';

import { Button, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react';
import { Form } from 'react-final-form'
import { get as _get, set as _set } from 'lodash';
import { ValidationError as YupValidationError } from 'yup';

import { SignUpContextProvider, useSignUpContext } from './context';
import StepperSignUp from './stepper/StepperSignUp';
import { SaveForm, WithMargin } from '../../../component';
import {
  DadosEmpresariaisValidationSchema,
  DadosPessoaisValidationSchema,
  DadosUsuarioValidationSchema,
  ICadastro
} from './validation-schema';
import { TypeSafeGuard } from '../../../util';
import { Steps } from './steps';
import { NomesFormularioSistema } from '../../../domain';
import { useGetFormState } from '../../../hook';
import { Optional } from '@vetnow-management/essentials';
import CadastroRestService from '../../../service/cadastro/CadastroRestService';

const useStyle = makeStyles({
  actionsButtons: {
    marginLeft: 0
  }
});

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
  const formStateFromDB = useGetFormState<ICadastro>(NomesFormularioSistema.CADASTRO_INICIAL);

  const {
    stepperStore: {
      currentStep,
      proximoStep,
      voltarStep,
    },
    formularioCadastro,
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
      formStateFromDB.then((value) => {
        Optional.from(value)
          .ifPresent((valuePresent) => {
            // @ts-ignore: Arrumar no util, colocar pra isso nunca ser null
            Object.keys(valuePresent)
              .forEach(key => {
                if(formularioCadastro.setField) {
                  // @ts-ignore: GGWP
                  formularioCadastro.setField()(key, valuePresent[key]);
                }
              })
          })
      })
    }
  }, []);

  const classes = useStyle();

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
    console.log('payload: ', payload);
    CadastroRestService.cadastrarResponsavel({
      ...payload,
      dtNascimento: JSON.stringify(payload.dtNascimento),
      empresa: { dataAbertura: JSON.stringify(payload.empresa.dataAbertura) }
    })
      .subscribe(
        res => console.log('Usuario crido: ', res),
        err => console.log('Erro ao cadastrar: ', err)
      );
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

  console.log('--------RENDER----------');
  return (
    <SignUpContextProvider>
      <Grid container item>
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
                        <SaveForm debounce={1000} formName={NomesFormularioSistema.CADASTRO_INICIAL}/>
                        <Steps />
                        <Grid item
                              container
                              direction='row'
                              alignItems='flex-start'
                              justify='flex-start'
                              spacing={ 1 }
                              className={classes.actionsButtons}
                        >
                          <Grid item >
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
                                            disabled={ isProximoButaoDisabled() }
                                            onClick={ proximoStep }
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
                          <Grid item md={ 4 }>
                            <Button fullWidth
                                    variant='outlined'
                                    color='secondary'
                                    onClick={ () => console.log('---IMPLEMENTAR O LIMPAR---') }
                            >
                              LIMPAR FORMULARIO
                            </Button>
                          </Grid>
                        </Grid>
                      </form>
                    )
                  } }
            />
          </WithMargin>
        </Grid>
      </Grid>
    </SignUpContextProvider>
  )
}

export default observer(SignUp);
