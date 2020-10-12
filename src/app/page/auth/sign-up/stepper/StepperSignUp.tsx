import React, { ReactElement } from 'react';

import {
  Step,
  Stepper,
  StepLabel,
  makeStyles,
} from '@material-ui/core';
import { observer } from 'mobx-react';

import { useBreakpoints } from '../../../../hook';
import { useSignUpContext } from '../context';

const useStyles = makeStyles({
  root: {
    borderRadius: '3px',
    margin: 15,
    width: '100%'
  }
});

function StepperSignUp(): ReactElement {
  const classes = useStyles();
  const match = useBreakpoints(true).up('sm')
  const {
    stepperStore: {
      currentStep,
      stepsAvailable,
    }
  } = useSignUpContext();

  function getLabel(label: string): string {
    if (match) return label;
    return '';
  }

  return (
    <Stepper id='STEPPER' className={classes.root} activeStep={currentStep} elevation={2} orientation='horizontal'>
      {stepsAvailable.map(({label, id}) => (
        <Step key={id}>
          <StepLabel>{getLabel(label)}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export default observer(StepperSignUp)
