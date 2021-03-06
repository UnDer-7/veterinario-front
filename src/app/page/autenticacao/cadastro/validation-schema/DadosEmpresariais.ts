import * as yup from 'yup';
import { addDays } from "date-fns";

import { SchemaMessages } from '../../../../util';
import ContatoValidationSchema from './Contato';
import EnderecoValidationSchema from './Endereco';

const {
  min,
  required,
} = SchemaMessages;

const CURRENT_DATE = new Date();

const DadosEmpresariaisValidationSchema = yup.object().shape({
  empresa: yup.object().shape({
    razaoSocial: yup
      .string()
      .required()
      .trim()
      .min(5, min(5)),
    documento: yup
      .string()
      .required()
      .trim(),
      // .test(
      //   'cnpj',
      //   cnpj,
      //   Validation.isCPF
      // ),
    nitPisPasep: yup.string().trim(),
    dataAbertura: yup
      .date()
      .required(required)
      .max(addDays(CURRENT_DATE, 1), 'Data nao pode passar de hoje'),
    contato: ContatoValidationSchema.defined(),
    endereco: EnderecoValidationSchema.defined(),
  }).defined(),
}).defined()

export default DadosEmpresariaisValidationSchema;
