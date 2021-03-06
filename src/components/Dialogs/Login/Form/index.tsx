import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormValidation from '@react-form-fields/material-ui/components/FormValidation';
import FieldText from '@react-form-fields/material-ui/components/Text';
import { FormComponent, IStateForm } from 'components/Abstract/Form';
import Toast from 'components/Shared/Toast';
import { WithStyles } from 'decorators/withStyles';
import React, { MouseEvent } from 'react';
import * as RxOp from 'rxjs-operators';
import authService from 'services/auth';

interface IState
  extends IStateForm<{
    email: string;
    password: string;
  }> {
  opened: boolean;
  loading: boolean;
}

interface IProps {
  classes?: any;
  onRecoveryAccess: (e: MouseEvent<HTMLElement>) => void;
}

@WithStyles({
  buttons: {
    justifyContent: 'space-between'
  }
})
export default class LoginDialogForm extends FormComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { ...this.state, opened: false, loading: false };
  }

  onSubmit = (isValid: boolean) => {
    if (!isValid) return;

    const { model } = this.state;
    this.setState({ loading: true });

    authService
      .login(model.email, model.password)
      .pipe(
        RxOp.logError(),
        RxOp.bindComponent(this)
      )
      .subscribe(
        () => {
          this.setState({ loading: false });
          this.resetForm();
        },
        err => {
          Toast.error(err);
          this.setState({ loading: false });
        }
      );
  };

  render() {
    const { model, loading } = this.state;
    const { classes, onRecoveryAccess } = this.props;

    return (
      <FormValidation onSubmit={this.onSubmit} ref={this.bindForm}>
        <Card>
          <CardContent>
            <FieldText
              label='Email'
              type='email'
              disabled={loading}
              value={model.email}
              validation='required|email'
              onChange={this.updateModel((model, v) => (model.email = v))}
              margin='dense'
            />

            <FieldText
              label='Senha'
              type='password'
              disabled={loading}
              value={model.password}
              validation='required'
              onChange={this.updateModel((model, v) => (model.password = v))}
            />
          </CardContent>

          <CardActions className={classes.buttons}>
            <Button disabled={loading} size='small' onClick={onRecoveryAccess}>
              Recuperar Acesso
            </Button>
            <Button disabled={loading} color='secondary' type='submit'>
              Entrar
            </Button>
          </CardActions>

          {loading && <LinearProgress color='secondary' />}
        </Card>
      </FormValidation>
    );
  }
}
